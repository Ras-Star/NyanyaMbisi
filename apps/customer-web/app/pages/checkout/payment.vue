<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCartStore } from "~/stores/cart";
import { useCustomerStore } from "~/stores/customer";

const cartStore = useCartStore();
const customerStore = useCustomerStore();
const api = useCustomerApi();
const { supplier, items, subtotalUgx } = storeToRefs(cartStore);
const { draft, quote, verifiedToken, paymentProvider, paymentSession } = storeToRefs(customerStore);
const { t } = useI18n();

useHead({
  title: "Payment"
});

const loading = ref(false);
const errorMessage = ref("");

async function createSession() {
  errorMessage.value = "";

  if (!supplier.value || !quote.value || !verifiedToken.value) {
    errorMessage.value = t("payment.requirements");
    return;
  }

  loading.value = true;

  try {
    const session = await api.createCheckoutSession({
      verifiedToken: verifiedToken.value,
      supplierSlug: supplier.value.slug,
      items: items.value,
      customer: draft.value,
      quote: quote.value,
      paymentProvider: paymentProvider.value
    });

    customerStore.setPaymentSession(session);
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="grid payment-page">
    <section class="section-header">
      <span class="eyebrow">{{ t("nav.checkout") }}</span>
      <h1 class="title-lg">{{ t("payment.title") }}</h1>
      <p class="muted">{{ t("payment.subtitle") }}</p>
    </section>

    <section v-if="!items.length || !quote || !verifiedToken" class="surface-card empty-state">
      <h2 class="title-md">{{ t("payment.incomplete") }}</h2>
      <NuxtLink class="btn btn--primary" to="/checkout">{{ t("nav.checkout") }}</NuxtLink>
    </section>

    <template v-else>
      <section class="glass-grid">
        <section class="surface-card payment-page__panel">
          <div class="section-header">
            <span class="eyebrow">{{ t("payment.provider") }}</span>
            <h2 class="title-md">{{ t("payment.chooseRail") }}</h2>
          </div>

          <div class="payment-page__providers">
            <button
              type="button"
              class="payment-page__provider surface-panel"
              :class="{ 'is-active': paymentProvider === 'mtn' }"
              :aria-pressed="paymentProvider === 'mtn'"
              @click="customerStore.setPaymentProvider('mtn')"
            >
              <strong>{{ t("payment.mtn") }}</strong>
              <span class="muted">{{ t("payment.mtnHint") }}</span>
            </button>
            <button
              type="button"
              class="payment-page__provider surface-panel"
              :class="{ 'is-active': paymentProvider === 'airtel' }"
              :aria-pressed="paymentProvider === 'airtel'"
              @click="customerStore.setPaymentProvider('airtel')"
            >
              <strong>{{ t("payment.airtel") }}</strong>
              <span class="muted">{{ t("payment.airtelHint") }}</span>
            </button>
          </div>

          <button type="button" class="btn btn--primary" :disabled="loading" @click="createSession">
            {{ t("payment.initiate") }}
          </button>
        </section>

        <section class="surface-card payment-page__panel">
          <PriceBreakdown :subtotal-ugx="subtotalUgx" :quote="quote" />
          <div v-if="errorMessage" class="status-note is-danger">
            <strong>{{ errorMessage }}</strong>
          </div>
          <div v-if="paymentSession" class="status-note is-success">
            <strong>{{ paymentSession.nextStepTitle }}</strong>
            <span>{{ paymentSession.nextStepBody }}</span>
          </div>
          <NuxtLink v-if="paymentSession" class="btn btn--sun" :to="`/order/${paymentSession.orderId}/pending`">
            {{ t("payment.track") }}
          </NuxtLink>
        </section>
      </section>
    </template>
  </div>
</template>

<style scoped>
.payment-page {
  gap: 1rem;
}

.payment-page__panel {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.payment-page__providers {
  display: grid;
  gap: 0.85rem;
}

.payment-page__provider {
  text-align: left;
  display: grid;
  gap: 0.35rem;
  padding: 1.05rem;
  border-radius: 22px;
  border: 0;
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.payment-page__provider:hover {
  transform: translateY(-2px);
}

.payment-page__provider.is-active {
  background: linear-gradient(135deg, rgba(29, 111, 59, 0.16), rgba(244, 196, 48, 0.18));
  box-shadow: 0 18px 34px rgba(20, 67, 36, 0.15);
}
</style>
