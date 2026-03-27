import { defineStore } from "pinia";
import type { Session, User } from "@supabase/supabase-js";
import type { CustomerNotification, CustomerProfile } from "~~/shared/types";

export const useAuthStore = defineStore("customer-auth", {
  state: () => ({
    ready: false,
    session: null as Session | null,
    user: null as User | null,
    fallbackToken: "",
    fallbackPhone: "",
    fallbackFullName: "",
    profile: null as CustomerProfile | null,
    notifications: [] as CustomerNotification[],
    activityOpen: false
  }),
  getters: {
    authMode: (state): "supabase" | "fallback" | "none" =>
      state.session?.access_token && state.user ? "supabase" : state.fallbackToken && state.fallbackPhone ? "fallback" : "none",
    isAuthenticated: (state) => Boolean((state.session?.access_token && state.user) || (state.fallbackToken && state.fallbackPhone)),
    unreadNotificationCount: (state) => state.notifications.filter((item) => !item.readAt).length,
    customerPhone: (state) => state.user?.phone ?? state.profile?.phone ?? state.fallbackPhone ?? "",
    customerName: (state) => state.profile?.fullName?.trim() || state.fallbackFullName.trim() || "",
    authToken: (state) => state.session?.access_token ?? state.fallbackToken ?? ""
  },
  actions: {
    setReady(value: boolean) {
      this.ready = value;
    },
    setSession(session: Session | null) {
      this.session = session;
      this.user = session?.user ?? null;

      if (session?.user) {
        this.fallbackToken = "";
        this.fallbackPhone = "";
        this.fallbackFullName = "";
      }
    },
    setFallbackSession(payload: { token: string; phone: string; fullName?: string }) {
      this.session = null;
      this.user = null;
      this.fallbackToken = payload.token;
      this.fallbackPhone = payload.phone;
      this.fallbackFullName = payload.fullName?.trim() ?? "";
    },
    hydrateLocalAuth(payload: Partial<{ fallbackToken: string; fallbackPhone: string; fallbackFullName: string; notifications: CustomerNotification[] }>) {
      this.fallbackToken = payload.fallbackToken ?? "";
      this.fallbackPhone = payload.fallbackPhone ?? "";
      this.fallbackFullName = payload.fallbackFullName ?? "";
      this.notifications = payload.notifications ?? [];
    },
    setProfile(profile: CustomerProfile | null) {
      this.profile = profile;

      if (!this.user && profile?.phone) {
        this.fallbackPhone = profile.phone;
      }

      if (!this.user && profile?.fullName?.trim()) {
        this.fallbackFullName = profile.fullName.trim();
      }
    },
    setNotifications(notifications: CustomerNotification[]) {
      this.notifications = notifications;
    },
    upsertNotification(notification: CustomerNotification) {
      const existingIndex = this.notifications.findIndex((item) => item.id === notification.id);

      if (existingIndex >= 0) {
        this.notifications.splice(existingIndex, 1, notification);
        return;
      }

      this.notifications.unshift(notification);
    },
    markNotificationReadLocal(notificationId: string, readAt: string) {
      const notification = this.notifications.find((item) => item.id === notificationId);

      if (notification) {
        notification.readAt = readAt;
      }
    },
    setActivityOpen(open: boolean) {
      this.activityOpen = open;
    },
    clear() {
      this.session = null;
      this.user = null;
      this.fallbackToken = "";
      this.fallbackPhone = "";
      this.fallbackFullName = "";
      this.profile = null;
      this.notifications = [];
      this.activityOpen = false;
    }
  }
});
