<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCartStore } from "~/stores/cart";
import { useCurrency } from "~/composables/useCurrency";

definePageMeta({
  middleware: "customer-auth"
});

const cartStore = useCartStore();
const { supplier, items, subtotalUgx, itemCount } = storeToRefs(cartStore);
const { formatUGX } = useCurrency();
const { t } = useI18n();

useHead({
  title: "Cart"
});
</script>

<template>
  <div class="grid cart-page">
    <section class="section-header">
      <span class="eyebrow">{{ t("nav.cart") }}</span>
      <h1 class="title-lg">{{ t("cart.title") }}</h1>
      <p class="muted">{{ t("cart.subtitle") }}</p>
    </section>

    <section v-if="!items.length" class="surface-card empty-state">
      <h2 class="title-md">{{ t("cart.emptyTitle") }}</h2>
      <p class="muted">{{ t("cart.emptyBody") }}</p>
      <NuxtLink class="btn btn--primary" to="/">{{ t("cart.browse") }}</NuxtLink>
    </section>

    <template v-else>
      <section class="surface-card cart-page__supplier">
        <AppImage
          class="cart-page__hero"
          :src="supplier?.hero || '/marketplace/home-hero.webp'"
          :alt="supplier?.name || 'Supplier'"
          ratio="1.25 / 1"
          sizes="100vw"
        />
        <div class="cart-page__supplier-copy">
          <h2 class="title-md">{{ supplier?.name }}</h2>
          <p class="muted">{{ supplier?.tagline }}</p>
          <p class="muted">{{ t("cart.itemCount", { count: itemCount }) }}</p>
        </div>
      </section>

      <section class="grid">
        <article v-for="item in items" :key="item.productId" class="surface-panel cart-line">
          <AppImage class="cart-line__image" :src="item.image" :alt="item.name" ratio="1 / 1" sizes="96px" />
          <div class="cart-line__copy">
            <div>
              <strong>{{ item.name }}</strong>
              <p class="muted">{{ item.unitLabel }}</p>
            </div>
            <div class="cart-line__controls">
              <div class="cart-line__stepper">
                <button type="button" @click="cartStore.setQuantity(item.productId, item.quantity - 1)">-</button>
                <span>{{ item.quantity }}</span>
                <button type="button" @click="cartStore.setQuantity(item.productId, item.quantity + 1)">+</button>
              </div>
              <strong>{{ formatUGX(item.priceUgx * item.quantity) }}</strong>
            </div>
          </div>
        </article>
      </section>

      <section class="glass-grid">
        <PriceBreakdown :subtotal-ugx="subtotalUgx" :quote="null" />
        <section class="surface-panel cart-page__notes">
          <h3 class="title-md">{{ t("cart.notesTitle") }}</h3>
          <p class="muted">{{ t("cart.deliveryHint") }}</p>
          <p class="muted">{{ t("cart.swapNote") }}</p>
          <NuxtLink class="btn btn--primary" to="/checkout">{{ t("cart.checkout") }}</NuxtLink>
        </section>
      </section>
    </template>
  </div>
</template>

<style scoped>
.cart-page {
  gap: 1.15rem;
}

.cart-page__supplier {
  display: grid;
  gap: 0;
}

.cart-page__hero {
  aspect-ratio: 1.25;
}

.cart-page__supplier-copy {
  padding: 1.15rem;
}

.cart-page__supplier-copy p {
  margin: 0.4rem 0 0;
}

.cart-line {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 0.9rem;
  padding: 0.95rem;
}

.cart-line__image {
  aspect-ratio: 1;
}

.cart-line__copy {
  display: grid;
  gap: 0.8rem;
}

.cart-line__copy p {
  margin: 0.24rem 0 0;
}

.cart-line__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cart-line__stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgba(240, 247, 234, 0.92);
}

.cart-line__stepper button {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: white;
  box-shadow: var(--shadow-sm);
  font-weight: 800;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

.cart-line__stepper button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(20, 67, 36, 0.14);
}

.cart-page__notes {
  display: grid;
  gap: 0.8rem;
  padding: 1.15rem;
}

.cart-page__notes p {
  margin: 0;
  line-height: 1.6;
}
</style>
