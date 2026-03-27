<script setup lang="ts">
import { useCurrency } from "~/composables/useCurrency";

definePageMeta({
  middleware: "customer-auth"
});

const route = useRoute();
const api = useCustomerApi();
const { initialize, refreshNotifications } = useCustomerAuth();
const { formatUGX } = useCurrency();
const { t } = useI18n();

await initialize();

const {
  data: order,
  pending,
  error,
  refresh
} = await useAsyncData(`order-${route.params.id}`, () => api.getOrder(route.params.id as string), {
  server: false
});

useHead(() => ({
  title: order.value ? `Order ${order.value.orderId}` : "Order"
}));

function statusMessageKey(label: string) {
  if (label === "Received") return "status.received";
  if (label === "Preparing") return "status.preparing";
  if (label === "Out for Delivery") return "status.outForDelivery";
  if (label === "Delivered") return "status.delivered";
  return label;
}

function paymentStatusKey(label: string) {
  if (label === "pending") return "status.pending";
  if (label === "confirmed") return "status.confirmed";
  if (label === "failed") return "status.failed";
  return label;
}

let pollHandle: number | null = null;

onMounted(() => {
  pollHandle = window.setInterval(() => {
    void Promise.all([refresh(), refreshNotifications()]);
  }, 15000);
});

onBeforeUnmount(() => {
  if (pollHandle) {
    window.clearInterval(pollHandle);
  }
});
</script>

<template>
  <div class="grid pending-page">
    <section class="section-header">
      <span class="eyebrow">{{ t("order.timeline") }}</span>
      <h1 class="title-lg">{{ t("order.title") }}</h1>
      <p class="muted">{{ t("order.subtitle") }}</p>
    </section>

    <section v-if="pending && !order" class="surface-card pending-page__loading"></section>

    <section v-else-if="error" class="surface-card empty-state">
      <h2 class="title-md">{{ t("orders.emptyTitle") }}</h2>
      <p class="muted">{{ error.message }}</p>
      <NuxtLink class="btn btn--primary" to="/orders">
        {{ t("nav.orders") }}
      </NuxtLink>
    </section>

    <template v-else-if="order">
      <section class="surface-card pending-page__hero">
        <div>
          <StatusChip :label="t(statusMessageKey(order.status))" />
          <h2 class="title-lg">{{ order.supplierName }}</h2>
          <p class="muted">{{ t("order.orderTotal") }} {{ formatUGX(order.totalUgx) }}</p>
        </div>
        <div class="pending-page__reference surface-panel">
          <span class="muted">{{ t("order.reference") }}</span>
          <strong>{{ order.paymentReference }}</strong>
          <span class="muted">{{ t("order.paymentStatus") }}: {{ t(paymentStatusKey(order.paymentStatus)) }}</span>
        </div>
      </section>

      <section class="glass-grid">
        <section class="surface-card pending-page__panel">
          <div class="section-header">
            <span class="eyebrow">{{ t("order.timeline") }}</span>
            <h3 class="title-md">{{ t("order.statusFlow") }}</h3>
          </div>

          <div class="pending-page__timeline">
            <div
              v-for="step in order.timeline"
              :key="step.label"
              class="pending-page__step"
              :class="{ 'is-complete': step.complete }"
            >
              <span class="pending-page__step-dot"></span>
              <div>
                <strong>{{ t(statusMessageKey(step.label)) }}</strong>
                <p class="muted">{{ step.complete ? t("order.currentStepBody") : t("order.pendingStepBody") }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="surface-card pending-page__panel">
          <div class="section-header">
            <span class="eyebrow">{{ t("common.customer") }}</span>
            <h3 class="title-md">{{ order.customer.fullName }}</h3>
          </div>
          <div class="status-note">
            <strong>{{ order.customer.phone }}</strong>
            <span>{{ order.customer.landmark }}</span>
            <span class="muted">{{ order.customer.areaHint }}</span>
          </div>
        </section>
      </section>
    </template>
  </div>
</template>

<style scoped>
.pending-page {
  gap: 1rem;
}

.pending-page__hero,
.pending-page__panel {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.pending-page__loading {
  min-height: 280px;
}

.pending-page__reference {
  display: grid;
  gap: 0.28rem;
  padding: 0.95rem 1rem;
}

.pending-page__timeline {
  display: grid;
  gap: 0.9rem;
}

.pending-page__step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  align-items: start;
}

.pending-page__step strong {
  display: block;
}

.pending-page__step p {
  margin: 0.24rem 0 0;
}

.pending-page__step-dot {
  width: 1rem;
  height: 1rem;
  margin-top: 0.25rem;
  border-radius: 999px;
  background: rgba(29, 111, 59, 0.18);
}

.pending-page__step.is-complete .pending-page__step-dot {
  background: var(--brand-leaf);
  box-shadow: 0 0 0 6px rgba(29, 111, 59, 0.12);
}

@media (min-width: 860px) {
  .pending-page__hero {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
    align-items: center;
  }
}
</style>
