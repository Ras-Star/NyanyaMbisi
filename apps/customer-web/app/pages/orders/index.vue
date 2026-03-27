<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth";
import { useCurrency } from "~/composables/useCurrency";

definePageMeta({
  middleware: "customer-auth"
});

const api = useCustomerApi();
const authStore = useAuthStore();
const { customerPhone, customerName } = storeToRefs(authStore);
const { initialize, saveProfile, signOut } = useCustomerAuth();
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

const editingName = ref(false);
const nameDraft = ref("");
const nameError = ref("");
const nameStatus = ref("");
const savingName = ref(false);
const warmGreeting = computed(() =>
  customerName.value ? t("account.warmGreetingNamed", { name: customerName.value }) : t("account.warmGreeting")
);

watch(
  customerName,
  (value) => {
    nameDraft.value = value || "";
  },
  { immediate: true }
);

function startEditingName() {
  nameError.value = "";
  nameStatus.value = "";
  nameDraft.value = customerName.value || "";
  editingName.value = true;
}

function cancelEditingName() {
  editingName.value = false;
  nameError.value = "";
  nameStatus.value = "";
  nameDraft.value = customerName.value || "";
}

async function saveName() {
  nameError.value = "";
  nameStatus.value = "";

  if (!nameDraft.value.trim()) {
    nameError.value = t("account.nameRequired");
    return;
  }

  savingName.value = true;

  try {
    await saveProfile({
      fullName: nameDraft.value.trim()
    });
    nameStatus.value = t("account.nameSaved");
    editingName.value = false;
  } catch (error) {
    nameError.value = (error as Error).message;
  } finally {
    savingName.value = false;
  }
}

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
      <div class="orders-page__hero-copy">
        <span class="eyebrow">{{ warmGreeting }}</span>
        <h2 class="title-md">{{ customerName || t("account.addNameTitle") }}</h2>
        <p class="muted">{{ customerPhone }}</p>
        <p class="muted">{{ customerName ? t("account.nameHint") : t("account.addNameHint") }}</p>
      </div>
      <div class="orders-page__hero-actions">
        <button v-if="!editingName" type="button" class="btn btn--primary" @click="startEditingName">
          {{ t("account.editName") }}
        </button>
        <button type="button" class="btn btn--secondary" @click="handleSignOut">
          {{ t("nav.signOut") }}
        </button>
      </div>
      <div v-if="editingName" class="orders-page__editor surface-panel">
        <label class="field-stack">
          <span class="field-label">{{ t("account.nameLabel") }}</span>
          <input v-model="nameDraft" class="field-input" type="text" :placeholder="t('checkout.name')" />
        </label>
        <div class="orders-page__editor-actions">
          <button type="button" class="btn btn--primary" :disabled="savingName" @click="saveName">
            {{ t("account.saveName") }}
          </button>
          <button type="button" class="btn btn--secondary" :disabled="savingName" @click="cancelEditingName">
            {{ t("common.cancel") }}
          </button>
        </div>
      </div>
      <div v-if="nameStatus" class="status-note is-success">
        <strong>{{ nameStatus }}</strong>
      </div>
      <div v-if="nameError" class="status-note is-danger">
        <strong>{{ nameError }}</strong>
      </div>
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

.orders-page__hero-copy {
  display: grid;
  gap: 0.35rem;
}

.orders-page__hero-copy p {
  margin: 0;
}

.orders-page__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.orders-page__editor {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
}

.orders-page__editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
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
