<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth";
import { useCurrency } from "~/composables/useCurrency";

definePageMeta({
  middleware: "customer-auth"
});

const api = useCustomerApi();
const authStore = useAuthStore();
const { profile, customerPhone } = storeToRefs(authStore);
const { initialize, signOut } = useCustomerAuth();
const { formatUGX } = useCurrency();
const { t } = useI18n();

await initialize();

const {
  data: orders,
  pending,
  error
} = await useAsyncData("customer-orders", () => api.getOrders(), {
  server: false,
  default: () => []
});

useHead({
  title: "Orders"
});

async function handleSignOut() {
  await signOut();
  await navigateTo("/");
}
</script>

<template>
  <div class="grid orders-page">
    <section class="section-header">
      <span class="eyebrow">{{ t("nav.orders") }}</span>
      <h1 class="title-lg">{{ t("orders.title") }}</h1>
      <p class="muted">{{ t("orders.subtitle") }}</p>
    </section>

    <section class="surface-card orders-page__hero">
      <div>
        <span class="eyebrow">{{ t("common.customer") }}</span>
        <h2 class="title-md">{{ profile?.fullName || customerPhone }}</h2>
        <p class="muted">{{ customerPhone }}</p>
      </div>
      <button type="button" class="btn btn--secondary" @click="handleSignOut">
        {{ t("nav.signOut") }}
      </button>
    </section>

    <section v-if="pending" class="surface-card orders-page__loading"></section>

    <section v-else-if="error" class="surface-card empty-state">
      <h2 class="title-md">{{ t("orders.emptyTitle") }}</h2>
      <p class="muted">{{ error.message }}</p>
    </section>

    <section v-else-if="orders.length" class="grid orders-page__list">
      <article v-for="order in orders" :key="order.orderId" class="surface-card orders-page__card">
        <div class="orders-page__card-header">
          <div>
            <StatusChip :label="t(`status.${order.status === 'Out for Delivery' ? 'outForDelivery' : order.status.toLowerCase()}`)" />
            <h2 class="title-md">{{ order.supplierName }}</h2>
            <p class="muted">{{ t("order.orderTotal") }} {{ formatUGX(order.totalUgx) }}</p>
          </div>
          <NuxtLink class="btn btn--primary" :to="`/orders/${order.orderId}`">
            {{ t("orders.viewOrder") }}
          </NuxtLink>
        </div>

        <div class="orders-page__meta">
          <div>
            <span class="muted">{{ t("order.reference") }}</span>
            <strong>{{ order.paymentReference }}</strong>
          </div>
          <div>
            <span class="muted">{{ t("orders.placedAt") }}</span>
            <strong>{{ new Date(order.createdAt).toLocaleString("en-UG") }}</strong>
          </div>
          <div>
            <span class="muted">{{ t("common.items", { count: order.items.length }) }}</span>
            <strong>{{ order.items.map((item) => item.name).join(", ") }}</strong>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="surface-card empty-state">
      <h2 class="title-md">{{ t("orders.emptyTitle") }}</h2>
      <p class="muted">{{ t("orders.emptyBody") }}</p>
      <NuxtLink class="btn btn--primary" to="/">
        {{ t("cart.browse") }}
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.orders-page {
  gap: 1rem;
}

.orders-page__hero,
.orders-page__card {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.orders-page__loading {
  min-height: 220px;
}

.orders-page__list {
  gap: 1rem;
}

.orders-page__card-header {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.orders-page__meta {
  display: grid;
  gap: 0.85rem;
}

.orders-page__meta span,
.orders-page__meta strong {
  display: block;
}

@media (min-width: 760px) {
  .orders-page__hero {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .orders-page__meta {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
