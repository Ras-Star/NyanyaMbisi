import type {
  CartLine,
  CheckoutCustomer,
  CheckoutSession,
  CustomerNotification,
  CustomerProfile,
  DeliveryQuote,
  MarketplaceResponse,
  MapPin,
  OrderSummary,
  OtpStartResponse,
  OtpVerifyResponse,
  PaymentProvider,
  SupplierStorefront
} from "~~/shared/types";
import { useAuthStore } from "~/stores/auth";

function resolveRoute(base: string, path: string) {
  const normalizedBase = base.trim().replace(/\/$/, "");
  return normalizedBase ? `${normalizedBase}${path}` : path;
}

export function useCustomerApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const route = (path: string) => resolveRoute(config.public.customerApiBase, path);
  const authHeaders = async (): Promise<Record<string, string>> => {
    const token = authStore.authToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    getMarketplace: () => $fetch<MarketplaceResponse>(route("/customer/marketplace")),
    getSupplier: (slug: string) => $fetch<SupplierStorefront>(route(`/customer/suppliers/${slug}`)),
    getProfile: async () =>
      $fetch<CustomerProfile>(route("/customer/profile"), {
        headers: await authHeaders()
      }),
    updateProfile: async (payload: { fullName?: string; defaultPin?: MapPin | null }) =>
      $fetch<CustomerProfile>(route("/customer/profile"), {
        method: "PATCH",
        headers: await authHeaders(),
        body: payload
      }),
    getOrders: async () =>
      $fetch<OrderSummary[]>(route("/customer/orders"), {
        headers: await authHeaders()
      }),
    getOrder: async (orderId: string) =>
      $fetch<OrderSummary>(route(`/customer/orders/${orderId}`), {
        headers: await authHeaders()
      }),
    getNotifications: async () =>
      $fetch<CustomerNotification[]>(route("/customer/notifications"), {
        headers: await authHeaders()
      }),
    markNotificationRead: async (notificationId: string) =>
      $fetch<CustomerNotification>(route(`/customer/notifications/${notificationId}/read`), {
        method: "POST",
        headers: await authHeaders()
      }),
    getDeliveryQuote: (payload: { supplierSlug: string; pin: MapPin | null; subtotalUgx: number }) =>
      $fetch<DeliveryQuote>(route("/customer/delivery-quote"), {
        method: "POST",
        body: payload
      }),
    startOtp: (payload: { fullName: string; phone: string }) =>
      $fetch<OtpStartResponse>(route("/customer/checkout/otp/start"), {
        method: "POST",
        body: payload
      }),
    verifyOtp: (payload: { sessionId: string; code: string }) =>
      $fetch<OtpVerifyResponse>(route("/customer/checkout/otp/verify"), {
        method: "POST",
        body: payload
      }),
    createCheckoutSession: async (payload: {
      supplierSlug: string;
      items: CartLine[];
      customer: CheckoutCustomer;
      quote: DeliveryQuote;
      paymentProvider: PaymentProvider;
    }) =>
      $fetch<CheckoutSession>(route("/customer/checkout/session"), {
        method: "POST",
        headers: await authHeaders(),
        body: payload
      })
  };
}
