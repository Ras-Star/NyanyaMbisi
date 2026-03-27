<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useCurrency } from "~/composables/useCurrency";

const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { itemCount, subtotalUgx } = storeToRefs(cartStore);
const { isAuthenticated } = storeToRefs(authStore);
const { formatUGX } = useCurrency();
const { t } = useI18n();

const visible = computed(
  () =>
    isAuthenticated.value &&
    itemCount.value > 0 &&
    !route.path.startsWith("/cart") &&
    !route.path.startsWith("/checkout") &&
    !route.path.startsWith("/order") &&
    !route.path.startsWith("/orders")
);
</script>

<template>
  <Transition name="dock">
    <NuxtLink v-if="visible" class="dock" to="/cart">
      <div>
        <strong>{{ t("common.items", { count: itemCount }) }}</strong>
        <div class="muted">{{ formatUGX(subtotalUgx) }}</div>
      </div>
      <span class="dock__cta">{{ t("common.openBasket") }}</span>
    </NuxtLink>
  </Transition>
</template>

<style scoped>
.dock {
  position: fixed;
  left: 0.9rem;
  right: 0.9rem;
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 35;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 24px;
  color: white;
  background: linear-gradient(135deg, var(--brand-leaf-deep), var(--brand-leaf));
  box-shadow: 0 24px 50px rgba(20, 67, 36, 0.28);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.dock:hover {
  transform: translateY(-2px);
  box-shadow: 0 28px 56px rgba(20, 67, 36, 0.34);
}

.dock__cta {
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-weight: 800;
}

.dock-enter-active,
.dock-leave-active {
  transition: all 180ms ease;
}

.dock-enter-from,
.dock-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (min-width: 880px) {
  .dock {
    left: auto;
    right: 1.5rem;
    width: 340px;
  }
}
</style>
