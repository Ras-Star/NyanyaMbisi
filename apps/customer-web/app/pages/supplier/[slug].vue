<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Product } from "~~/shared/types";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useCurrency } from "~/composables/useCurrency";

const route = useRoute();
const api = useCustomerApi();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { initialize } = useCustomerAuth();
const { supplier: cartSupplier, items } = storeToRefs(cartStore);
const { isAuthenticated } = storeToRefs(authStore);
const { formatUGX, formatKm } = useCurrency();
const { t } = useI18n();

const allCategoryLabel = computed(() => t("supplier.all"));
const activeCategory = ref(allCategoryLabel.value);
const { data: supplier, pending } = await useAsyncData(`supplier-${route.params.slug}`, () =>
  api.getSupplier(route.params.slug as string)
);

useHead(() => ({
  title: supplier.value?.name ?? "Supplier"
}));

watch(
  allCategoryLabel,
  (value) => {
    if (!supplier.value?.categories.includes(activeCategory.value)) {
      activeCategory.value = value;
    }
  },
  { immediate: true }
);

const categoryOptions = computed(() => [allCategoryLabel.value, ...(supplier.value?.categories ?? [])]);
const filteredProducts = computed(() => {
  if (!supplier.value) {
    return [];
  }

  return activeCategory.value === allCategoryLabel.value
    ? supplier.value.products
    : supplier.value.products.filter((product) => product.category === activeCategory.value);
});

async function addProduct(product: Product) {
  await initialize();

  if (!isAuthenticated.value) {
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  if (!supplier.value) {
    return;
  }

  cartStore.addProduct(supplier.value, product);
}

function isAdded(productId: string) {
  return items.value.some((item) => item.productId === productId && cartSupplier.value?.id === supplier.value?.id);
}
</script>

<template>
  <div class="grid supplier-page">
    <section v-if="supplier" class="supplier-page__hero surface-card">
      <AppImage
        class="supplier-page__hero-image"
        :src="supplier.hero"
        :alt="supplier.name"
        ratio="1.04 / 1"
        sizes="(min-width: 860px) 48vw, 100vw"
        preload
      />
      <div class="supplier-page__hero-copy">
        <div class="pill-row">
          <StatusChip :label="t('common.verified')" />
          <StatusChip :label="supplier.prepWindow" tone="sun" />
        </div>
        <h1 class="title-lg">{{ supplier.name }}</h1>
        <p class="muted">{{ supplier.story }}</p>
        <div class="supplier-page__hero-meta">
          <article class="surface-panel">
            <span class="muted">{{ t("supplier.minBasket") }}</span>
            <strong>{{ formatUGX(supplier.minBasketUgx) }}</strong>
          </article>
          <article class="surface-panel">
            <span class="muted">{{ t("supplier.prepWindow") }}</span>
            <strong>{{ supplier.prepWindow }}</strong>
          </article>
          <article class="surface-panel">
            <span class="muted">{{ t("supplier.rating") }}</span>
            <strong>{{ supplier.rating.toFixed(1) }}/5</strong>
          </article>
          <article class="surface-panel">
            <span class="muted">{{ t("supplier.distanceAway") }}</span>
            <strong>{{ formatKm(supplier.distanceKm) }}</strong>
          </article>
        </div>
        <div class="pill-row">
          <span v-for="badge in supplier.badges" :key="badge" class="pill">{{ badge }}</span>
        </div>
      </div>
    </section>

    <section v-if="cartSupplier && cartSupplier.id !== supplier?.id && items.length" class="status-note">
      <strong>{{ t("cart.swapNote") }}</strong>
      <span class="muted">{{ t("supplier.basketNote") }}</span>
    </section>

    <section class="section-header">
      <span class="eyebrow">{{ t("supplier.categories") }}</span>
      <h2 class="title-lg">{{ t("supplier.buildBasket") }}</h2>
    </section>

    <div class="pill-row">
      <button
        v-for="category in categoryOptions"
        :key="category"
        type="button"
        class="pill"
        :class="{ 'is-active': activeCategory === category }"
        @click="activeCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <section v-if="pending && !supplier" class="glass-grid">
      <div v-for="index in 4" :key="index" class="surface-card supplier-page__skeleton"></div>
    </section>

    <section v-else-if="filteredProducts.length" class="glass-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        :added="isAdded(product.id)"
        @add="addProduct"
      />
    </section>

    <section v-else class="surface-card empty-state">
      <h2 class="title-md">{{ t("supplier.emptyCategory") }}</h2>
    </section>
  </div>
</template>

<style scoped>
.supplier-page {
  gap: 1.15rem;
}

.supplier-page__hero {
  display: grid;
  gap: 0;
}

.supplier-page__hero-image {
  aspect-ratio: 1.04;
}

.supplier-page__hero-copy {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.supplier-page__hero-copy p {
  margin: 0;
  line-height: 1.65;
}

.supplier-page__hero-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.supplier-page__hero-meta article {
  padding: 1rem 1.05rem;
}

.supplier-page__hero-meta span,
.supplier-page__hero-meta strong {
  display: block;
}

.supplier-page__skeleton {
  min-height: 380px;
}

@media (min-width: 860px) {
  .supplier-page__hero {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    align-items: center;
  }
}
</style>
