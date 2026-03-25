<script setup lang="ts">
import type { LaunchZone } from "~~/shared/types";

const props = defineProps<{
  zones: LaunchZone[];
  supplierCount: number;
  heroImage: string;
  featureMessage?: string;
}>();

const { t } = useI18n();
const zoneSummary = computed(() => props.zones.map((zone) => zone.name).join(", "));

useHead({
  link: [
    {
      rel: "preload",
      as: "image",
      href: props.heroImage,
      fetchpriority: "high"
    }
  ]
});
</script>

<template>
  <section class="hero surface-card">
    <div class="hero__copy">
      <span class="eyebrow">{{ t("hero.eyebrow") }}</span>
      <h1 class="title-display">{{ t("hero.title") }}</h1>
      <p class="hero__subtitle muted">{{ t("hero.subtitle") }}</p>

      <div class="pill-row">
        <span class="pill">{{ t("hero.suppliersCount", { count: supplierCount }) }}</span>
        <span class="pill">{{ t("home.platformFee") }} · UGX 1,500</span>
      </div>

      <div class="hero__actions">
        <a class="btn btn--primary" href="#suppliers">{{ t("hero.cta") }}</a>
        <a class="btn btn--secondary" href="#quick-start">{{ t("hero.secondaryCta") }}</a>
      </div>

      <p class="hero__promise muted">{{ t("hero.promise") }}</p>

      <div class="hero__stats">
        <div class="hero__stat surface-panel">
          <strong>15-35 {{ t("common.minutes") }}</strong>
          <span class="muted">{{ t("hero.prepWindowLabel") }}</span>
        </div>
        <div class="hero__stat surface-panel">
          <strong>{{ t("hero.launchZoneCount", { count: zones.length }) }}</strong>
          <span class="muted">{{ zoneSummary }}</span>
        </div>
      </div>

      <div class="hero__trust">
        <span>{{ t("home.trustOne") }}</span>
        <span>{{ t("home.trustTwo") }}</span>
        <span>{{ t("home.trustThree") }}</span>
      </div>
    </div>

    <div class="hero__visual">
      <AppImage
        class="hero__image"
        :src="heroImage"
        :alt="t('hero.mapAlt')"
        ratio="1.08 / 1"
        sizes="(min-width: 860px) 40vw, 100vw"
        preload
        loading="eager"
      />

      <div v-if="featureMessage" class="hero__feature surface-panel">
        <span class="eyebrow">{{ t("hero.featuredEyebrow") }}</span>
        <p>{{ featureMessage }}</p>
      </div>

      <div class="hero__zones">
        <article v-for="zone in zones" :key="zone.id" class="hero__zone">
          <strong>{{ zone.name }}</strong>
          <span class="muted">{{ zone.description }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow: hidden;
}

.hero__copy {
  display: grid;
  gap: 1.05rem;
  align-content: start;
}

.hero__subtitle {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
}

.hero__actions {
  display: grid;
  gap: 0.8rem;
}

.hero__actions .btn {
  width: 100%;
}

.hero__promise {
  margin: 0;
  line-height: 1.6;
}

.hero__stats,
.hero__zones {
  display: grid;
  gap: 0.75rem;
}

.hero__stat,
.hero__zone {
  padding: 0.95rem 1rem;
}

.hero__stat strong,
.hero__zone strong {
  display: block;
  margin-bottom: 0.22rem;
}

.hero__visual {
  display: grid;
  gap: 0.95rem;
}

.hero__image {
  aspect-ratio: 1.08;
}

.hero__feature {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
}

.hero__feature p {
  margin: 0;
  line-height: 1.55;
}

.hero__trust {
  display: grid;
  gap: 0.55rem;
  font-size: 0.92rem;
  line-height: 1.55;
}

@media (min-width: 860px) {
  .hero {
    grid-template-columns: 1.2fr 0.9fr;
    align-items: center;
    padding: 1.9rem;
  }

  .hero__zones {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hero__actions {
    grid-template-columns: repeat(2, minmax(0, max-content));
    align-items: center;
  }

  .hero__actions .btn {
    width: auto;
  }
}
</style>
