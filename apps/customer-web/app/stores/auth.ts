import { defineStore } from "pinia";
import type { Session, User } from "@supabase/supabase-js";
import type { CustomerNotification, CustomerProfile } from "~~/shared/types";

export const useAuthStore = defineStore("customer-auth", {
  state: () => ({
    ready: false,
    session: null as Session | null,
    user: null as User | null,
    profile: null as CustomerProfile | null,
    notifications: [] as CustomerNotification[],
    activityOpen: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.session?.access_token && state.user),
    unreadNotificationCount: (state) => state.notifications.filter((item) => !item.readAt).length,
    customerPhone: (state) => state.user?.phone ?? state.profile?.phone ?? "",
    customerName: (state) => state.profile?.fullName?.trim() || ""
  },
  actions: {
    setReady(value: boolean) {
      this.ready = value;
    },
    setSession(session: Session | null) {
      this.session = session;
      this.user = session?.user ?? null;
    },
    setProfile(profile: CustomerProfile | null) {
      this.profile = profile;
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
      this.profile = null;
      this.notifications = [];
      this.activityOpen = false;
    }
  }
});
