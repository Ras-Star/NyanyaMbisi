<script setup lang="ts">
import { storeToRefs } from "pinia";
import { launchZones } from "~~/shared/service-areas";
import { useCartStore } from "~/stores/cart";
import { useCustomerStore } from "~/stores/customer";

const { t, locale } = useI18n();
const api = useCustomerApi();
const cartStore = useCartStore();
const customerStore = useCustomerStore();
const { supplier, items, subtotalUgx } = storeToRefs(cartStore);
const { draft, otpSession, verifiedToken, verifiedCustomer, quote } = storeToRefs(customerStore);

useHead({
  title: "Checkout"
});

watch(
  locale,
  (value) => {
    customerStore.setLocale(value as "en" | "lg");
  },
  { immediate: true }
);

const otpCode = ref("");
const otpLoading = ref(false);
const verifyLoading = ref(false);
const quoteLoading = ref(false);
const statusMessage = ref("");
const errorMessage = ref("");

const canContinue = computed(() => Boolean(items.value.length && verifiedToken.value && quote.value?.serviceable));

watch(
  () => draft.value.pin,
  () => {
    customerStore.setQuote(null);
  },
  { deep: true }
);

async function sendOtp() {
  errorMessage.value = "";
  statusMessage.value = "";

  if (!draft.value.fullName || !draft.value.phone) {
    errorMessage.value = t("checkout.requiredFields");
    return;
  }

  otpLoading.value = true;

  try {
    const response = await api.startOtp({
      fullName: draft.value.fullName,
      phone: draft.value.phone
    });
    customerStore.setOtpSession(response);
    statusMessage.value = t("checkout.otpSent", { code: response.devCode });
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    otpLoading.value = false;
  }
}

async function verifyOtpCode() {
  errorMessage.value = "";
  statusMessage.value = "";

  if (!otpSession.value || !otpCode.value) {
    errorMessage.value = t("checkout.startOtpFirst");
    return;
  }

  verifyLoading.value = true;

  try {
    const response = await api.verifyOtp({
      sessionId: otpSession.value.sessionId,
      code: otpCode.value
    });
    customerStore.setVerified(response);
    statusMessage.value = t("checkout.phoneVerified");
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    verifyLoading.value = false;
  }
}

async function refreshQuote() {
  errorMessage.value = "";
  statusMessage.value = "";

  if (!supplier.value?.slug || !draft.value.pin) {
    errorMessage.value = t("checkout.pinRequired");
    return;
  }

  quoteLoading.value = true;

  try {
    const response = await api.getDeliveryQuote({
      supplierSlug: supplier.value.slug,
      pin: draft.value.pin,
      subtotalUgx: subtotalUgx.value
    });
    customerStore.setQuote(response);
    statusMessage.value = response.serviceable
      ? t("checkout.quoteReady")
      : t("checkout.quoteOutside");
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    quoteLoading.value = false;
  }
}
</script>

<template>
  <div class="grid checkout-page">
    <section class="section-header">
      <span class="eyebrow">{{ t("nav.checkout") }}</span>
      <h1 class="title-lg">{{ t("checkout.title") }}</h1>
      <p class="muted">{{ t("checkout.subtitle") }}</p>
    </section>

    <section v-if="!items.length" class="surface-card empty-state">
      <h2 class="title-md">{{ t("cart.emptyTitle") }}</h2>
      <NuxtLink class="btn btn--primary" to="/">{{ t("cart.browse") }}</NuxtLink>
    </section>

    <template v-else>
      <section class="glass-grid">
        <section class="surface-card checkout-page__panel">
          <div class="section-header">
            <span class="eyebrow">{{ t("checkout.authTitle") }}</span>
            <h2 class="title-md">{{ supplier?.name }}</h2>
            <p class="muted">{{ t("checkout.authBody") }}</p>
          </div>

          <div class="grid checkout-page__form">
            <label class="field-stack">
              <span class="field-label">{{ t("checkout.name") }}</span>
              <input v-model="draft.fullName" class="field-input" type="text" />
            </label>

            <label class="field-stack">
              <span class="field-label">{{ t("checkout.phone") }}</span>
              <input v-model="draft.phone" class="field-input" type="tel" placeholder="+256 7..." />
            </label>

            <div class="checkout-page__actions">
              <button type="button" class="btn btn--secondary" :disabled="otpLoading" @click="sendOtp">
                {{ t("checkout.otpButton") }}
              </button>
              <label class="field-stack checkout-page__otp">
                <span class="field-label">{{ t("checkout.code") }}</span>
                <input v-model="otpCode" class="field-input" type="text" inputmode="numeric" />
              </label>
              <button type="button" class="btn btn--primary" :disabled="verifyLoading" @click="verifyOtpCode">
                {{ t("checkout.verifyButton") }}
              </button>
            </div>

            <div v-if="verifiedCustomer" class="status-note is-success">
              <strong>{{ t("checkout.verified") }}</strong>
              <span>{{ verifiedCustomer.phone }}</span>
            </div>
          </div>
        </section>

        <section class="surface-card checkout-page__panel">
          <div class="section-header">
            <span class="eyebrow">{{ t("location.title") }}</span>
            <h2 class="title-md">{{ t("checkout.launchArea") }}</h2>
          </div>

          <div class="grid checkout-page__form">
            <label class="field-stack">
              <span class="field-label">{{ t("checkout.landmark") }}</span>
              <input v-model="draft.landmark" class="field-input" type="text" />
            </label>

            <label class="field-stack">
              <span class="field-label">{{ t("checkout.area") }}</span>
              <input v-model="draft.areaHint" class="field-input" type="text" />
            </label>

            <label class="field-stack">
              <span class="field-label">{{ t("checkout.notes") }}</span>
              <textarea v-model="draft.notes" class="field-textarea"></textarea>
            </label>
          </div>
        </section>
      </section>

      <LocationPicker v-model="draft.pin" :zones="launchZones" />

      <section class="glass-grid">
        <section class="surface-card checkout-page__panel">
          <PriceBreakdown :subtotal-ugx="subtotalUgx" :quote="quote" />
          <div class="checkout-page__quote-actions">
            <button type="button" class="btn btn--sun" :disabled="quoteLoading" @click="refreshQuote">
              {{ t("common.calculate") }}
            </button>
            <NuxtLink class="btn btn--primary" :class="{ 'is-disabled': !canContinue }" :to="canContinue ? '/checkout/payment' : '/checkout'">
              {{ t("checkout.continuePayment") }}
            </NuxtLink>
          </div>
        </section>

        <section class="surface-card checkout-page__panel">
          <div v-if="statusMessage" class="status-note is-success">
            <strong>{{ statusMessage }}</strong>
            <span v-if="otpSession?.devCode">Demo OTP: {{ otpSession.devCode }}</span>
          </div>

          <div v-if="errorMessage" class="status-note is-danger">
            <strong>{{ errorMessage }}</strong>
          </div>

          <div v-if="quote && !quote.serviceable" class="status-note is-danger">
            <strong>{{ t("checkout.quoteOut") }}</strong>
            <span>{{ quote.reasons?.join(" ") }}</span>
          </div>

          <div class="status-note">
            <strong>{{ t("checkout.policyTitle") }}</strong>
            <span class="muted">{{ t("checkout.policyBody") }}</span>
          </div>
        </section>
      </section>
    </template>
  </div>
</template>

<style scoped>
.checkout-page {
  gap: 1.15rem;
}

.checkout-page__panel {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.checkout-page__form {
  gap: 0.95rem;
}

.checkout-page__actions {
  display: grid;
  gap: 0.9rem;
}

.checkout-page__otp {
  align-self: end;
}

.checkout-page__quote-actions {
  display: grid;
  gap: 0.9rem;
}

.is-disabled {
  pointer-events: none;
  opacity: 0.55;
}

@media (min-width: 760px) {
  .checkout-page__actions {
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: end;
  }

  .checkout-page__quote-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
