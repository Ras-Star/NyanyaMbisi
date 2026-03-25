import { defineStore } from "pinia";
import type {
  CheckoutCustomer,
  CheckoutSession,
  DeliveryQuote,
  LocaleCode,
  OtpStartResponse,
  OtpVerifyResponse,
  PaymentProvider
} from "~~/shared/types";

export const useCustomerStore = defineStore("customer", {
  state: () => ({
    draft: {
      fullName: "",
      phone: "",
      landmark: "",
      areaHint: "",
      notes: "",
      pin: null,
      locale: "en"
    } as CheckoutCustomer,
    otpSession: null as OtpStartResponse | null,
    verifiedToken: "" as string,
    verifiedCustomer: null as OtpVerifyResponse["customer"] | null,
    quote: null as DeliveryQuote | null,
    paymentProvider: "mtn" as PaymentProvider,
    paymentSession: null as CheckoutSession | null
  }),
  actions: {
    hydrate(
      payload: Partial<{
        draft: CheckoutCustomer;
        otpSession: OtpStartResponse | null;
        verifiedToken: string;
        verifiedCustomer: OtpVerifyResponse["customer"] | null;
        quote: DeliveryQuote | null;
        paymentProvider: PaymentProvider;
        paymentSession: CheckoutSession | null;
      }>
    ) {
      this.$patch(payload as never);
    },
    updateDraft(patch: Partial<CheckoutCustomer>) {
      this.draft = {
        ...this.draft,
        ...patch
      };
    },
    setLocale(locale: LocaleCode) {
      this.draft.locale = locale;
    },
    setOtpSession(session: OtpStartResponse | null) {
      this.otpSession = session;
    },
    setVerified(result: OtpVerifyResponse | null) {
      this.verifiedToken = result?.token ?? "";
      this.verifiedCustomer = result?.customer ?? null;
    },
    setQuote(quote: DeliveryQuote | null) {
      this.quote = quote;
    },
    setPaymentProvider(provider: PaymentProvider) {
      this.paymentProvider = provider;
    },
    setPaymentSession(session: CheckoutSession | null) {
      this.paymentSession = session;
    },
    resetAfterOrder() {
      this.quote = null;
      this.paymentSession = null;
    }
  }
});
