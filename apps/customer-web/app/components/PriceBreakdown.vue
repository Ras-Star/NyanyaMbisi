<script setup lang="ts">
import type { DeliveryQuote } from "~~/shared/types";
import { useCurrency } from "~/composables/useCurrency";

const props = defineProps<{
  subtotalUgx: number;
  quote: DeliveryQuote | null;
}>();

const { formatUGX, formatKm } = useCurrency();
const { t } = useI18n();

const fallbackTotal = computed(() => props.subtotalUgx + 1500);
</script>

<template>
  <section class="breakdown surface-panel">
    <div class="breakdown__row">
      <span>{{ t("breakdown.groceries") }}</span>
      <strong>{{ formatUGX(subtotalUgx) }}</strong>
    </div>
    <div class="breakdown__row">
      <span>{{ t("breakdown.delivery") }}</span>
      <strong>{{ formatUGX(quote?.deliveryFeeUgx ?? 0) }}</strong>
    </div>
    <div class="breakdown__row">
      <span>{{ t("breakdown.platformFee") }}</span>
      <strong>{{ formatUGX(quote?.platformFeeUgx ?? 1500) }}</strong>
    </div>
    <div v-if="quote" class="breakdown__row muted">
      <span>{{ t("breakdown.distance") }}</span>
      <strong>{{ formatKm(quote.distanceKm) }} · {{ quote.zoneName }}</strong>
    </div>
    <div class="breakdown__row breakdown__total">
      <span>{{ t("breakdown.total") }}</span>
      <strong>{{ formatUGX(quote?.totalUgx ?? fallbackTotal) }}</strong>
    </div>
  </section>
</template>

<style scoped>
.breakdown {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
}

.breakdown__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.breakdown__total {
  padding-top: 0.45rem;
  font-size: 1.05rem;
}
</style>
