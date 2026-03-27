import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) {
    return;
  }

  const authStore = useAuthStore();
  const { initialize } = useCustomerAuth();

  await initialize();

  if (!authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
