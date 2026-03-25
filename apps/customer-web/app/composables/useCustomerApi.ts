import type {
  CartLine,
  CheckoutCustomer,
  CheckoutSession,
  DeliveryQuote,
  MarketplaceResponse,
  MapPin,
  OrderSummary,
  OtpStartResponse,
  OtpVerifyResponse,
  PaymentProvider,
  SupplierStorefront
} from "~~/shared/types";

function resolveRoute(base: string, path: string) {
  const normalizedBase = base.trim().replace(/\/$/, "");
  return normalizedBase ? `${normalizedBase}${path}` : path;
}

export function useCustomerApi() {
  const config = useRuntimeConfig();
  const route = (path: string) => resolveRoute(config.public.customerApiBase, path);

  return {
    getMarketplace: () => $fetch<MarketplaceResponse>(route("/customer/marketplace")),
    getSupplier: (slug: string) => $fetch<SupplierStorefront>(route(`/customer/suppliers/${slug}`)),
    getOrder: (orderId: string) => $fetch<OrderSummary>(route(`/customer/orders/${orderId}`)),
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
    createCheckoutSession: (payload: {
      verifiedToken: string;
      supplierSlug: string;
      items: CartLine[];
      customer: CheckoutCustomer;
      quote: DeliveryQuote;
      paymentProvider: PaymentProvider;
    }) =>
      $fetch<CheckoutSession>(route("/customer/checkout/session"), {
        method: "POST",
        body: payload
      })
  };
}

