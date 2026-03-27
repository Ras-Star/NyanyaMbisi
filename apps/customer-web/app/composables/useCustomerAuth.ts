import { getUgandanMobileProvider, normalizePhoneNumber } from "~~/shared/phone";
import type { MapPin } from "~~/shared/types";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useCustomerStore } from "~/stores/customer";

let authInitPromise: Promise<void> | null = null;
let authSubscriptionBound = false;

type PhoneSignInStart = {
  phone: string;
  provider: "mtn" | "airtel";
  channel: "sms" | "fallback";
  sessionId?: string;
  devCode?: string;
};

export function useCustomerAuth() {
  const authStore = useAuthStore();
  const customerStore = useCustomerStore();
  const cartStore = useCartStore();
  const api = useCustomerApi();
  const supabase = useSupabaseBrowserClient();

  function syncPreferredPaymentProvider(phone: string) {
    const provider = getUgandanMobileProvider(phone);

    if (provider) {
      customerStore.setPaymentProvider(provider);
    }
  }

  function isUnsupportedPhoneProviderError(message: string) {
    const normalized = message.toLowerCase();

    return (
      normalized.includes("unsupported phone provider") ||
      normalized.includes("phone provider") ||
      normalized.includes("sms provider")
    );
  }

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
    syncPreferredPaymentProvider(profile.phone || authStore.customerPhone);

    return profile;
  }

  async function refreshNotifications() {
    if (!authStore.isAuthenticated) {
      authStore.setNotifications([]);
      return [];
    }

    const previousReadAtById = new Map(authStore.notifications.map((item) => [item.id, item.readAt]));
    const notifications = await api.getNotifications();
    const mergedNotifications = notifications.map((item) => ({
      ...item,
      readAt: item.readAt ?? previousReadAtById.get(item.id) ?? null
    }));

    authStore.setNotifications(mergedNotifications);
    return mergedNotifications;
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
        if (authStore.authMode === "fallback") {
          customerStore.updateDraft({
            phone: authStore.customerPhone
          });
          void refreshCustomerState().finally(() => {
            authStore.setReady(true);
          });
          return;
        }

        authStore.clear();
        cartStore.clearCart();
        customerStore.resetForSignOut();
        authStore.setReady(true);
        return;
      }

      customerStore.updateDraft({
        phone: session.user.phone ?? customerStore.draft.phone
      });
      syncPreferredPaymentProvider(session.user.phone ?? customerStore.draft.phone);

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
      if (authStore.authMode === "fallback") {
        customerStore.updateDraft({
          phone: authStore.customerPhone
        });
        syncPreferredPaymentProvider(authStore.customerPhone);
        await refreshCustomerState();
      }

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
          syncPreferredPaymentProvider(session.user.phone ?? customerStore.draft.phone);
          await refreshCustomerState();
        } else if (authStore.authMode === "fallback") {
          customerStore.updateDraft({
            phone: authStore.customerPhone
          });
          syncPreferredPaymentProvider(authStore.customerPhone);
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
    return authStore.authToken;
  }

  async function signInWithPhone(phone: string): Promise<PhoneSignInStart> {
    const normalizedPhone = normalizePhoneNumber(phone);
    const provider = getUgandanMobileProvider(phone);

    if (!normalizedPhone || !provider) {
      throw new Error("Use an MTN Uganda or Airtel Uganda mobile number starting with +256 or 0.");
    }

    syncPreferredPaymentProvider(normalizedPhone);

    if (!supabase) {
      const fallback = await api.startOtp({
        fullName: authStore.customerName,
        phone: normalizedPhone
      });

      return {
        phone: fallback.phone,
        provider,
        channel: "fallback",
        sessionId: fallback.sessionId,
        devCode: fallback.devCode
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone
    });

    if (!error) {
      return {
        phone: normalizedPhone,
        provider,
        channel: "sms"
      };
    }

    if (isUnsupportedPhoneProviderError(error.message)) {
      const fallback = await api.startOtp({
        fullName: authStore.customerName,
        phone: normalizedPhone
      });

      return {
        phone: fallback.phone,
        provider,
        channel: "fallback",
        sessionId: fallback.sessionId,
        devCode: fallback.devCode
      };
    }

    throw new Error(error.message);
  }

  async function verifyPhoneOtp({
    phone,
    otpCode,
    sessionId
  }: {
    phone: string;
    otpCode: string;
    sessionId?: string;
  }) {
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone) {
      throw new Error("Use an MTN Uganda or Airtel Uganda mobile number starting with +256 or 0.");
    }

    if (sessionId) {
      const data = await api.verifyOtp({
        sessionId,
        code: otpCode.trim()
      });

      authStore.setFallbackSession({
        token: data.token,
        phone: data.customer.phone || normalizedPhone,
        fullName: data.customer.fullName || authStore.customerName
      });
      customerStore.updateDraft({
        phone: data.customer.phone || normalizedPhone
      });
      syncPreferredPaymentProvider(data.customer.phone || normalizedPhone);

      await refreshCustomerState();
      authStore.setReady(true);

      return data;
    }

    if (!supabase) {
      throw new Error("Phone sign-in is not configured.");
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
    syncPreferredPaymentProvider(data.user?.phone ?? normalizedPhone);

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
    if (authStore.authMode === "fallback") {
      const readAt = new Date().toISOString();
      authStore.markNotificationReadLocal(notificationId, readAt);
      return authStore.notifications.find((item) => item.id === notificationId) ?? null;
    }

    const notification = await api.markNotificationRead(notificationId);

    if (notification?.readAt) {
      authStore.markNotificationReadLocal(notification.id, notification.readAt);
    }

    return notification;
  }

  async function signOut() {
    if (supabase && authStore.session) {
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
