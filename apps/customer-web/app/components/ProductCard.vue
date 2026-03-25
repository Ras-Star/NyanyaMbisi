<script setup lang="ts">
import type { Product } from "~~/shared/types";
import { useCurrency } from "~/composables/useCurrency";

defineProps<{
  product: Product;
  added?: boolean;
}>();

const emit = defineEmits<{
  add: [product: Product];
}>();

const { formatUGX } = useCurrency();
const { t } = useI18n();
</script>

<template>
  <article class="product surface-card">
    <AppImage
      class="product__image"
      :src="product.image"
      :alt="product.name"
      ratio="1.02 / 1"
      sizes="(min-width: 980px) 33vw, (min-width: 700px) 50vw, 100vw"
    />

    <div class="product__content">
      <div class="product__top">
        <div>
          <h3 class="product__title">{{ product.name }}</h3>
          <p class="muted product__description">{{ product.description }}</p>
        </div>
        <StatusChip v-if="product.popular" :label="t('supplier.popular')" tone="sun" />
      </div>

      <div class="product__bottom">
        <div>
          <strong>{{ formatUGX(product.priceUgx) }}</strong>
          <span class="muted">{{ product.unitLabel }}</span>
        </div>

        <button
          type="button"
          class="btn product__button"
          :class="added ? 'btn--secondary' : 'btn--primary'"
          @click="emit('add', product)"
        >
          {{ added ? t("common.added") : t("common.add") }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product {
  display: grid;
  gap: 0;
  overflow: hidden;
}

.product__image {
  aspect-ratio: 1.02;
}

.product__content {
  display: grid;
  gap: 1rem;
  padding: 1.1rem;
}

.product__top {
  display: grid;
  gap: 0.8rem;
}

.product__title {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.product__description {
  margin: 0;
  line-height: 1.55;
}

.product__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.product__bottom strong,
.product__bottom span {
  display: block;
}

@media (max-width: 520px) {
  .product__bottom {
    display: grid;
  }

  .product__button {
    width: 100%;
  }
}
</style>
