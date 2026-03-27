<script setup lang="ts">
import { storeToRefs } from "pinia";
import { launchZones } from "~~/shared/service-areas";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useCustomerStore } from "~/stores/customer";

definePageMeta({
  middleware: "customer-auth"
});

const { t, locale } = useI18n();
const api = useCustomerApi();
const authStore = useAuthStore();
const cartStore = useCartStore();
const customerStore = useCustomerStore();
const { initialize, saveProfile } = useCustomerAuth();
const { supplier, items, subtotalUgx } = storeToRefs(cartStore);
const { profile, customerPhone } = storeToRefs(authStore);
const { draft, quote } = storeToRefs(customerStore);

await initialize();

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

watch(
  [profile, customerPhone],
  ([nextProfile, nextPhone]) => {
    customerStore.hydrateFromProfile(nextProfile, nextPhone);
  },
  { immediate: true, deep: true }
);

watch(
  () => draft.value.pin,
  () => {
    customerStore.setQuote(null);
  },
  { deep: true }
);

const quoteLoading = ref(false);
const profileSaving = ref(false);
const statusMessage = ref("");
const errorMessage = ref("");

const canContinue = computed(
  () => Boolean(items.value.length && customerPhone.value && draft.value.fullName.trim() && quote.value?.serviceable)
);

async function persistProfile() {
  if (!customerPhone.value) {
    return;
  }

  profileSaving.value = true;

  try {
    await saveProfile({
      fullName: draft.value.fullName.trim(),
      defaultPin: draft.value.pin
    });
  } finally {
    profileSaving.value = false;
  }
}

async function refreshQuote() {
  errorMessage.value = "";
  statusMessage.value = "";

  if (!supplier.value?.slug || !draft.value.pin) {
    errorMessage.value = t("checkout.pinRequired");
    return;
  }

  if (!draft.value.fullName.trim()) {
    errorMessage.value = t("checkout.nameRequired");
    return;
  }

  quoteLoading.value = true;

  try {
    await persistProfile();
    const response = await api.getDeliveryQuote({
      supplierSlug: supplier.value.slug,
      pin: draft.value.pin,
      subtotalUgx: subtotalUgx.value
    });
    customerStore.setQuote(response);
    statusMessage.value = response.serviceable ? t("checkout.quoteReady") : t("checkout.quoteOutside");
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
              <input :value="customerPhone" class="field-input" type="tel" readonly />
            </label>

            <div class="status-note is-success">
              <strong>{{ t("checkout.signedIn") }}</strong>
              <span>{{ customerPhone }}</span>
            </div>

            <div v-if="profileSaving" class="status-note">
              <strong>{{ t("checkout.savingProfile") }}</strong>
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

.checkout-page__quote-actions {
  display: grid;
  gap: 0.9rem;
}

.is-disabled {
  pointer-events: none;
  opacity: 0.55;
}

@media (min-width: 760px) {
  .checkout-page__quote-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
