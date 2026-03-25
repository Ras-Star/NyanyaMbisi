<script setup lang="ts">
import type { LaunchZoneId } from "~~/shared/types";
import { deliveryBands } from "~~/shared/service-areas";
import { homeJourneySteps, homeQuickPicks } from "~~/data/home";

const { t } = useI18n();
const api = useCustomerApi();

useHead({
  title: "Marketplace"
});

const search = ref("");
const activeZone = ref<LaunchZoneId | "all">("all");
const { data: marketplace, pending } = await useAsyncData("marketplace", () => api.getMarketplace());
const hasActiveFilters = computed(() => Boolean(search.value.trim() || activeZone.value !== "all"));
const launchZoneNames = computed(() => (marketplace.value?.launchZones ?? []).map((zone) => zone.name).join(" · "));

const filteredSuppliers = computed(() => {
  const suppliers = marketplace.value?.suppliers ?? [];
  const searchValue = search.value.trim().toLowerCase();

  return suppliers.filter((supplier) => {
    const matchesZone = activeZone.value === "all" || supplier.area === activeZone.value;
    const matchesSearch =
      !searchValue ||
      supplier.name.toLowerCase().includes(searchValue) ||
      supplier.tagline.toLowerCase().includes(searchValue) ||
      supplier.categories.some((category) => category.toLowerCase().includes(searchValue));

    return matchesZone && matchesSearch;
  });
});

async function jumpTo(id: string) {
  await nextTick();

  if (!import.meta.client) {
    return;
  }

  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function applyQuickPick(pick: (typeof homeQuickPicks)[number]) {
  search.value = pick.searchTerm;
  activeZone.value = pick.zoneId ?? "all";
  await jumpTo("suppliers");
}

function clearFilters() {
  search.value = "";
  activeZone.value = "all";
}
</script>

<template>
  <div class="grid marketplace">
    <HeroPanel
      :zones="marketplace?.launchZones ?? []"
      :supplier-count="marketplace?.suppliers.length ?? 0"
      hero-image="/marketplace/home-hero.webp"
      :feature-message="marketplace?.featuredMessage"
    />

    <section id="discover" class="surface-card marketplace__search">
      <div class="section-header">
        <span class="eyebrow">{{ t("home.searchLabel") }}</span>
        <h2 class="title-lg">{{ t("home.searchHeading") }}</h2>
        <p class="muted">{{ t("home.resultsCount", { count: filteredSuppliers.length }) }}</p>
      </div>

      <div class="marketplace__search-row">
        <div class="field-stack">
          <input
            v-model="search"
            class="field-input"
            type="search"
            :placeholder="t('home.searchPlaceholder')"
          />
        </div>

        <button v-if="hasActiveFilters" type="button" class="btn btn--secondary" @click="clearFilters">
          {{ t("home.resetFilters") }}
        </button>
      </div>

      <div class="pill-row">
        <button type="button" class="pill" :class="{ 'is-active': activeZone === 'all' }" @click="activeZone = 'all'">
          {{ t("home.allZones") }}
        </button>
        <button
          v-for="zone in marketplace?.launchZones ?? []"
          :key="zone.id"
          type="button"
          class="pill"
          :class="{ 'is-active': activeZone === zone.id }"
          @click="activeZone = zone.id"
        >
          {{ zone.name }}
        </button>
      </div>

      <div class="marketplace__search-meta">
        <article class="surface-panel marketplace__search-note">
          <span class="eyebrow">{{ t("home.launchZones") }}</span>
          <strong>{{ launchZoneNames }}</strong>
          <p class="muted">{{ t("checkout.policyBody") }}</p>
        </article>

        <article class="surface-panel marketplace__search-note">
          <span class="eyebrow">{{ t("home.deliveryBands") }}</span>
          <strong>UGX 2,000 - 6,000</strong>
          <p class="muted">{{ t("home.tierDirect") }}</p>
        </article>

        <article class="surface-panel marketplace__search-note">
          <span class="eyebrow">{{ t("home.platformFee") }}</span>
          <strong>UGX 1,500</strong>
          <p class="muted">{{ t("home.serviceHint") }}</p>
        </article>
      </div>
    </section>

    <section id="quick-start" class="surface-card marketplace__quick-start">
      <div class="section-header">
        <span class="eyebrow">{{ t("home.quickStartEyebrow") }}</span>
        <h2 class="title-lg">{{ t("home.quickStartTitle") }}</h2>
        <p class="muted">{{ t("home.quickStartBody") }}</p>
      </div>

      <div class="marketplace__quick-grid">
        <button
          v-for="pick in homeQuickPicks"
          :key="pick.id"
          type="button"
          class="surface-panel marketplace__quick-card"
          @click="applyQuickPick(pick)"
        >
          <AppImage
            class="marketplace__quick-image"
            :src="pick.image"
            :alt="t(pick.titleKey)"
            ratio="1.08 / 1"
            sizes="(min-width: 980px) 22vw, (min-width: 700px) 48vw, 100vw"
          />
          <div class="marketplace__quick-copy">
            <strong>{{ t(pick.titleKey) }}</strong>
            <span class="muted">{{ t(pick.bodyKey) }}</span>
            <span class="marketplace__quick-link">
              {{ t("common.continue") }}
              <span aria-hidden="true">-></span>
            </span>
          </div>
        </button>
      </div>
    </section>

    <section class="section-header">
      <span class="eyebrow">{{ t("home.featured") }}</span>
      <h2 id="suppliers" class="title-lg">{{ t("home.supplierTitle") }}</h2>
    </section>

    <section v-if="pending && !marketplace" class="glass-grid">
      <div v-for="index in 3" :key="index" class="surface-card marketplace__skeleton"></div>
    </section>

    <section v-else-if="filteredSuppliers.length" class="glass-grid marketplace__suppliers">
      <SupplierCard v-for="supplier in filteredSuppliers" :key="supplier.id" :supplier="supplier" />
    </section>

    <section v-else class="surface-card empty-state">
      <h2 class="title-md">{{ t("home.noResults") }}</h2>
      <p class="muted">{{ t("home.tryAnother") }}</p>
    </section>

    <section id="how-it-works" class="marketplace__journey">
      <div class="section-header">
        <span class="eyebrow">{{ t("home.howItWorksEyebrow") }}</span>
        <h2 class="title-lg">{{ t("home.howItWorksTitle") }}</h2>
        <p class="muted">{{ t("home.howItWorksBody") }}</p>
      </div>

      <div class="glass-grid marketplace__journey-grid">
        <article v-for="step in homeJourneySteps" :key="step.id" class="surface-panel marketplace__journey-card">
          <span class="marketplace__journey-index">{{ step.number }}</span>
          <strong>{{ t(step.titleKey) }}</strong>
          <p class="muted">{{ t(step.bodyKey) }}</p>
        </article>
      </div>
    </section>

    <section class="glass-grid">
      <article v-for="band in deliveryBands" :key="band.maxKm" class="surface-panel marketplace__fee">
        <span class="eyebrow">{{ t("home.deliveryBands") }}</span>
        <strong>{{ band.maxKm === 2 ? "0-2 km" : band.maxKm === 5 ? "2-5 km" : "5-8 km" }}</strong>
        <p class="muted">UGX {{ band.feeUgx.toLocaleString("en-UG") }} {{ t("home.tierDirect") }}</p>
      </article>

      <article class="surface-panel marketplace__fee">
        <span class="eyebrow">{{ t("home.platformFee") }}</span>
        <strong>UGX 1,500</strong>
        <p class="muted">{{ t("home.serviceHint") }}</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.marketplace {
  gap: 1.4rem;
}

.marketplace__quick-start,
.marketplace__search {
  display: grid;
  gap: 1.1rem;
  padding: 1.3rem;
}

.marketplace__quick-grid {
  display: grid;
  gap: 1rem;
}

.marketplace__quick-card {
  padding: 0;
  text-align: left;
  display: grid;
  gap: 0;
  border: 0;
  color: inherit;
  cursor: pointer;
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    filter 200ms ease;
}

.marketplace__quick-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-xl);
}

.marketplace__quick-image {
  aspect-ratio: 1.08;
}

.marketplace__quick-copy {
  display: grid;
  gap: 0.3rem;
  padding: 1.05rem 1.05rem 1.1rem;
}

.marketplace__quick-copy strong,
.marketplace__quick-copy span {
  display: block;
}

.marketplace__quick-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--brand-leaf);
  font-weight: 800;
  margin-top: 0.25rem;
}

.marketplace__journey {
  display: grid;
  gap: 1rem;
}

.marketplace__journey-grid {
  align-items: stretch;
}

.marketplace__journey-card {
  display: grid;
  gap: 0.55rem;
  padding: 1.1rem;
}

.marketplace__journey-card p {
  margin: 0;
  line-height: 1.6;
}

.marketplace__journey-index {
  width: fit-content;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: rgba(29, 111, 59, 0.12);
  color: var(--brand-leaf);
  font-weight: 800;
  letter-spacing: 0.08em;
}

.marketplace__search p {
  margin: 0;
}

.marketplace__search-row {
  display: grid;
  gap: 0.75rem;
}

.marketplace__search-meta {
  display: grid;
  gap: 0.75rem;
}

.marketplace__search-note {
  display: grid;
  gap: 0.35rem;
  padding: 1.1rem;
}

.marketplace__search-note p {
  margin: 0;
  line-height: 1.55;
}

.marketplace__fee {
  padding: 1.1rem;
  display: grid;
  gap: 0.4rem;
}

.marketplace__fee strong {
  font-size: 1.3rem;
}

.marketplace__skeleton {
  min-height: 340px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(230, 239, 214, 0.84)),
    linear-gradient(90deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.65));
}

.marketplace__suppliers {
  align-items: start;
}

@media (min-width: 980px) {
  .marketplace__quick-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .marketplace__suppliers {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 560px) {
  .marketplace__quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 760px) {
  .marketplace__search-row {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .marketplace__search-meta {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
