import { normalizePhoneNumber } from "~~/shared/phone";
import type { MapPin } from "~~/shared/types";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useCustomerStore } from "~/stores/customer";

let authInitPromise: Promise<void> | null = null;
let authSubscriptionBound = false;

export function useCustomerAuth() {
  const authStore = useAuthStore();
  const customerStore = useCustomerStore();
  const cartStore = useCartStore();
  const api = useCustomerApi();
  const supabase = useSupabaseBrowserClient();

  async function refreshProfile() {
    if (!authStore.isAuthenticated) {
      authStore.setProfile(null);
      return null;
    }

    const profile = await api.getProfile();
    authStore.setProfile(profile);

    customerStore.updateDraft({
      fullName: profile.fullName || customerStore.draft.fullName,
      phone: profile.phone || authStore.customerPhone,
      pin: profile.defaultPin ?? customerStore.draft.pin
    });

    return profile;
  }

  async function refreshNotifications() {
    if (!authStore.isAuthenticated) {
      authStore.setNotifications([]);
      return [];
    }

    const notifications = await api.getNotifications();
    authStore.setNotifications(notifications);
    return notifications;
  }

  async function refreshCustomerState() {
    if (!authStore.isAuthenticated) {
      authStore.setProfile(null);
      authStore.setNotifications([]);
      return;
    }

    await Promise.all([refreshProfile(), refreshNotifications()]);
  }

  function bindAuthSubscription() {
    if (!supabase || authSubscriptionBound) {
      return;
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      authStore.setSession(session);

      if (!session?.user) {
        authStore.clear();
        cartStore.clearCart();
        customerStore.resetForSignOut();
        authStore.setReady(true);
        return;
      }

      customerStore.updateDraft({
        phone: session.user.phone ?? customerStore.draft.phone
      });

      void refreshCustomerState().finally(() => {
        authStore.setReady(true);
      });
    });

    authSubscriptionBound = true;
  }

  async function initialize() {
    if (!import.meta.client) {
      return;
    }

    if (authStore.ready && authSubscriptionBound) {
      return;
    }

    if (!supabase) {
      authStore.setReady(true);
      return;
    }

    bindAuthSubscription();

    if (!authInitPromise) {
      authInitPromise = (async () => {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        authStore.setSession(session);

        if (session?.user) {
          customerStore.updateDraft({
            phone: session.user.phone ?? customerStore.draft.phone
          });
          await refreshCustomerState();
        }

        authStore.setReady(true);
      })().finally(() => {
        authInitPromise = null;
      });
    }

    await authInitPromise;
  }

  async function getAccessToken() {
    await initialize();
    return authStore.session?.access_token ?? "";
  }

  async function signInWithPhone(phone: string) {
    if (!supabase) {
      throw new Error("Supabase phone login is not configured.");
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
      throw new Error("Enter a valid phone number in international format.");
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone
    });

    if (error) {
      throw new Error(error.message);
    }

    return normalizedPhone;
  }

  async function verifyPhoneOtp(phone: string, otpCode: string) {
    if (!supabase) {
      throw new Error("Supabase phone login is not configured.");
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
      throw new Error("Enter a valid phone number in international format.");
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: otpCode.trim(),
      type: "sms"
    });

    if (error) {
      throw new Error(error.message);
    }

    authStore.setSession(data.session ?? null);
    customerStore.updateDraft({
      phone: data.user?.phone ?? normalizedPhone
    });

    await refreshCustomerState();
    authStore.setReady(true);

    return data;
  }

  async function saveProfile(patch: { fullName?: string; defaultPin?: MapPin | null }) {
    const profile = await api.updateProfile(patch);
    authStore.setProfile(profile);

    customerStore.updateDraft({
      fullName: profile.fullName,
      phone: profile.phone,
      pin: profile.defaultPin ?? customerStore.draft.pin
    });

    return profile;
  }

  async function markNotificationRead(notificationId: string) {
    const notification = await api.markNotificationRead(notificationId);

    if (notification?.readAt) {
      authStore.markNotificationReadLocal(notification.id, notification.readAt);
    }

    return notification;
  }

  async function signOut() {
    if (supabase) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
    }

    authStore.clear();
    cartStore.clearCart();
    customerStore.resetForSignOut();
    authStore.setReady(true);
  }

  return {
    initialize,
    getAccessToken,
    signInWithPhone,
    verifyPhoneOtp,
    refreshProfile,
    refreshNotifications,
    refreshCustomerState,
    saveProfile,
    markNotificationRead,
    signOut
  };
}
