import { defineStore } from "pinia";
import type {
  CheckoutCustomer,
  CheckoutSession,
  CustomerProfile,
  DeliveryQuote,
  LocaleCode,
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
    quote: null as DeliveryQuote | null,
    paymentProvider: "mtn" as PaymentProvider,
    paymentSession: null as CheckoutSession | null
  }),
  actions: {
    hydrate(
      payload: Partial<{
        draft: CheckoutCustomer;
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
    setQuote(quote: DeliveryQuote | null) {
      this.quote = quote;
    },
    setPaymentProvider(provider: PaymentProvider) {
      this.paymentProvider = provider;
    },
    setPaymentSession(session: CheckoutSession | null) {
      this.paymentSession = session;
    },
    hydrateFromProfile(profile: CustomerProfile | null, phone: string) {
      if (!profile && !phone) {
        return;
      }

      this.draft = {
        ...this.draft,
        phone: profile?.phone || phone || this.draft.phone,
        fullName: profile?.fullName || this.draft.fullName,
        pin: profile?.defaultPin ?? this.draft.pin
      };
    },
    resetAfterOrder() {
      this.quote = null;
      this.paymentSession = null;
    },
    resetForSignOut() {
      this.draft = {
        fullName: "",
        phone: "",
        landmark: "",
        areaHint: "",
        notes: "",
        pin: null,
        locale: this.draft.locale
      };
      this.quote = null;
      this.paymentSession = null;
    }
  }
});
