<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string;
    alt: string;
    sizes?: string;
    ratio?: string;
    preload?: boolean;
    loading?: "lazy" | "eager";
    fit?: "cover" | "contain";
  }>(),
  {
    sizes: "100vw",
    ratio: "",
    preload: false,
    loading: "lazy",
    fit: "cover"
  }
);

const imageElement = ref<HTMLImageElement | null>(null);
const loaded = ref(false);
const prefersReducedMotion = ref(false);

function markLoaded() {
  loaded.value = true;
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (imageElement.value?.complete) {
    loaded.value = true;
  }
});

const imageLoading = computed(() => (props.preload ? "eager" : props.loading));
const imageDecoding = computed(() => (props.preload ? "sync" : "async"));
const imageFetchPriority = computed(() => (props.preload ? "high" : "auto"));
</script>

<template>
  <div
    class="app-image"
    :class="{ 'is-loaded': loaded, 'reduce-motion': prefersReducedMotion }"
    :style="{ aspectRatio: ratio || undefined, '--image-fit': fit }"
  >
    <img
      ref="imageElement"
      class="app-image__img"
      :src="src"
      :alt="alt"
      :loading="imageLoading"
      :decoding="imageDecoding"
      :fetchpriority="imageFetchPriority"
      @load="markLoaded"
      @error="markLoaded"
    />
    <div class="app-image__veil" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.app-image {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(244, 196, 48, 0.16), rgba(255, 255, 255, 0.75)),
    linear-gradient(90deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.14));
}

.app-image__img {
  width: 100%;
  height: 100%;
  object-fit: var(--image-fit);
  opacity: 0;
  transform: scale(1.035);
  transition:
    opacity 260ms ease,
    transform 420ms ease;
}

.app-image__veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.42) 36%, transparent 72%),
    linear-gradient(180deg, rgba(17, 69, 36, 0.03), rgba(17, 69, 36, 0.08));
  animation: shimmer 1.35s linear infinite;
  transition: opacity 220ms ease;
  pointer-events: none;
}

.app-image.is-loaded .app-image__img {
  opacity: 1;
  transform: scale(1);
}

.app-image.is-loaded .app-image__veil {
  opacity: 0;
}

.app-image.reduce-motion .app-image__img,
.app-image.reduce-motion .app-image__veil {
  transition: none;
  animation: none;
}

@keyframes shimmer {
  from {
    transform: translateX(-30%);
  }

  to {
    transform: translateX(30%);
  }
}
</style>
