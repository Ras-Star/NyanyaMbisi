<script setup lang="ts">
import type { SupplierCard } from "~~/shared/types";
import { useCurrency } from "~/composables/useCurrency";

defineProps<{
  supplier: SupplierCard;
}>();

const { formatUGX } = useCurrency();
const { t } = useI18n();
</script>

<template>
  <NuxtLink :to="`/supplier/${supplier.slug}`" class="supplier surface-card">
    <div class="supplier__media">
      <AppImage
        class="supplier__hero"
        :src="supplier.hero"
        :alt="supplier.name"
        ratio="1.18 / 1"
        sizes="(min-width: 980px) 33vw, (min-width: 700px) 50vw, 100vw"
      />
      <div class="supplier__badges">
        <StatusChip v-if="supplier.verified" :label="t('common.verified')" />
        <StatusChip :label="`${supplier.etaMinutes} ${t('common.minutes')}`" tone="sun" />
      </div>
    </div>

    <div class="supplier__content">
      <div>
        <h3 class="title-md supplier__title">{{ supplier.name }}</h3>
        <p class="muted supplier__tagline">{{ supplier.tagline }}</p>
      </div>

      <div class="pill-row">
        <span v-for="category in supplier.categories.slice(0, 2)" :key="category" class="pill">{{ category }}</span>
      </div>

      <div class="supplier__meta">
        <div>
          <span class="muted">{{ t("supplier.minBasket") }}</span>
          <strong>{{ formatUGX(supplier.minBasketUgx) }}</strong>
        </div>
        <div>
          <span class="muted">{{ t("supplier.pickupPartner") }}</span>
          <strong>{{ supplier.pickupPartner }}</strong>
        </div>
      </div>

      <div class="supplier__footer">
        <span class="muted">{{ supplier.distanceKm.toFixed(1) }} km</span>
        <strong class="supplier__cta">
          {{ t("home.openStore") }}
          <span aria-hidden="true">-></span>
        </strong>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.supplier {
  display: grid;
  gap: 0;
  color: inherit;
}

.supplier__media {
  position: relative;
}

.supplier__hero {
  aspect-ratio: 1.18;
}

.supplier__badges {
  position: absolute;
  left: 0.9rem;
  right: 0.9rem;
  bottom: 0.9rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.supplier__content {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.supplier__title {
  margin-bottom: 0.35rem;
}

.supplier__tagline {
  margin: 0;
  line-height: 1.55;
}

.supplier__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.supplier__meta span,
.supplier__meta strong {
  display: block;
}

.supplier__meta strong {
  margin-top: 0.15rem;
}

.supplier__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.supplier__footer strong {
  font-size: 0.95rem;
}

.supplier__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--brand-leaf);
}
</style>
