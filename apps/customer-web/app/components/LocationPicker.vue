<script setup lang="ts">
import type { LaunchZone, MapPin } from "~~/shared/types";

declare global {
  interface Window {
    google?: any;
    __nyanyaMbisiGooglePromise?: Promise<any>;
  }
}

const props = defineProps<{
  modelValue: MapPin | null;
  zones: LaunchZone[];
}>();

const emit = defineEmits<{
  "update:modelValue": [pin: MapPin];
}>();

const runtimeConfig = useRuntimeConfig();
const mapElement = ref<HTMLElement | null>(null);
const googleReady = ref(false);
const googleFailed = ref(false);
const bounds = {
  latMin: 0.335,
  latMax: 0.405,
  lngMin: 32.752,
  lngMax: 32.818
};

const fallbackPin = props.modelValue ?? {
  lat: props.zones[0]?.center.lat ?? 0.3772,
  lng: props.zones[0]?.center.lng ?? 32.7746,
  zoneId: props.zones[0]?.id ?? "namilyango"
};

const draftPin = ref<MapPin>({ ...fallbackPin });
let mapInstance: any;
let markerInstance: any;
const { t } = useI18n();

function distanceScore(a: MapPin, b: MapPin) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

function nearestZone(pin: MapPin) {
  return props.zones
    .map((zone) => ({ zone, distance: distanceScore(zone.center, pin) }))
    .sort((left, right) => left.distance - right.distance)[0]?.zone;
}

function normalizePin(pin: MapPin) {
  const zone = nearestZone(pin);
  return {
    ...pin,
    zoneId: zone?.id ?? null
  };
}

function setDraftFromRatios(xRatio: number, yRatio: number) {
  const lat = bounds.latMax - (bounds.latMax - bounds.latMin) * yRatio;
  const lng = bounds.lngMin + (bounds.lngMax - bounds.lngMin) * xRatio;
  draftPin.value = normalizePin({ lat, lng });
}

function confirmPin() {
  emit("update:modelValue", {
    ...normalizePin(draftPin.value),
    confirmedAt: new Date().toISOString()
  });
}

const activeZoneName = computed(() => props.zones.find((zone) => zone.id === draftPin.value.zoneId)?.name ?? "—");

function handleFallbackClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const xRatio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const yRatio = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
  setDraftFromRatios(xRatio, yRatio);
}

const sliderLat = computed({
  get: () => draftPin.value.lat,
  set: (value: number | string) => {
    draftPin.value = normalizePin({
      ...draftPin.value,
      lat: Number(value)
    });
  }
});

const sliderLng = computed({
  get: () => draftPin.value.lng,
  set: (value: number | string) => {
    draftPin.value = normalizePin({
      ...draftPin.value,
      lng: Number(value)
    });
  }
});

async function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) {
    return window.google;
  }

  if (!window.__nyanyaMbisiGooglePromise) {
    window.__nyanyaMbisiGooglePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => resolve(window.google);
      script.onerror = reject;
      document.head.append(script);
    });
  }

  return window.__nyanyaMbisiGooglePromise;
}

async function initGoogleMap() {
  if (!import.meta.client || !runtimeConfig.public.googleMapsApiKey || !mapElement.value) {
    return;
  }

  try {
    await loadGoogleMaps(runtimeConfig.public.googleMapsApiKey);
    googleReady.value = true;

    mapInstance = new window.google.maps.Map(mapElement.value, {
      center: { lat: draftPin.value.lat, lng: draftPin.value.lng },
      zoom: 13,
      disableDefaultUI: true,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] }
      ]
    });

    markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      position: { lat: draftPin.value.lat, lng: draftPin.value.lng },
      draggable: true
    });

    mapInstance.addListener("click", (event: any) => {
      const pin = normalizePin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      draftPin.value = pin;
      markerInstance.setPosition(pin);
    });

    markerInstance.addListener("dragend", (event: any) => {
      draftPin.value = normalizePin({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });
  } catch {
    googleFailed.value = true;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      draftPin.value = { ...value };
      markerInstance?.setPosition(value);
      mapInstance?.panTo(value);
    }
  },
  { deep: true }
);

onMounted(() => {
  void initGoogleMap();
});
</script>

<template>
  <section class="location-picker surface-panel">
    <div class="section-header">
      <span class="eyebrow">{{ $t("location.title") }}</span>
      <p class="muted location-picker__body">{{ $t("location.body") }}</p>
    </div>

    <div class="pill-row">
      <span v-for="zone in zones" :key="zone.id" class="pill" :class="{ 'is-active': draftPin.zoneId === zone.id }">
        {{ zone.name }}
      </span>
    </div>

    <div v-if="googleReady" ref="mapElement" class="location-picker__map"></div>

    <button v-else type="button" class="location-picker__fallback" @click="handleFallbackClick">
      <div class="location-picker__backdrop"></div>
      <div
        class="location-picker__dot"
        :style="{
          left: `${((draftPin.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100}%`,
          top: `${((bounds.latMax - draftPin.lat) / (bounds.latMax - bounds.latMin)) * 100}%`
        }"
      ></div>
      <span v-for="zone in zones" :key="zone.id" class="location-picker__zone" :style="{ '--x': `${((zone.center.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100}%`, '--y': `${((bounds.latMax - zone.center.lat) / (bounds.latMax - bounds.latMin)) * 100}%` }">
        {{ zone.name }}
      </span>
    </button>

    <p v-if="googleFailed" class="muted">{{ t("location.unavailable") }}</p>

    <div class="location-picker__controls">
      <label class="field-stack">
        <span class="field-label">{{ t("location.latitude") }}</span>
        <input v-model="sliderLat" class="field-input" type="range" :min="bounds.latMin" :max="bounds.latMax" step="0.0005" />
      </label>
      <label class="field-stack">
        <span class="field-label">{{ t("location.longitude") }}</span>
        <input v-model="sliderLng" class="field-input" type="range" :min="bounds.lngMin" :max="bounds.lngMax" step="0.0005" />
      </label>
    </div>

    <div class="location-picker__summary">
      <div>
        <span class="muted">{{ t("location.activeZone") }}</span>
        <strong>{{ activeZoneName }}</strong>
      </div>
      <div>
        <span class="muted">{{ t("location.latitude") }}</span>
        <strong>{{ draftPin.lat.toFixed(4) }}</strong>
      </div>
      <div>
        <span class="muted">{{ t("location.longitude") }}</span>
        <strong>{{ draftPin.lng.toFixed(4) }}</strong>
      </div>
    </div>

    <button type="button" class="btn btn--sun" @click="confirmPin">
      {{ t("location.confirmPin") }}
    </button>
  </section>
</template>

<style scoped>
.location-picker {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
}

.location-picker__body {
  margin: 0;
  line-height: 1.55;
}

.location-picker__map,
.location-picker__fallback {
  position: relative;
  min-height: 280px;
  border: 0;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.location-picker__fallback {
  cursor: pointer;
  background:
    linear-gradient(150deg, rgba(29, 111, 59, 0.2), rgba(255, 255, 255, 0.4)),
    linear-gradient(180deg, #dff0cf 0%, #cfe7bb 44%, #f9e78e 100%);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.location-picker__fallback:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(20, 67, 36, 0.14);
}

.location-picker__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 28%, rgba(255, 255, 255, 0.6), transparent 18%),
    radial-gradient(circle at 72% 52%, rgba(255, 255, 255, 0.5), transparent 24%),
    linear-gradient(115deg, transparent 45%, rgba(108, 83, 34, 0.22) 46%, transparent 47%),
    linear-gradient(180deg, transparent 70%, rgba(29, 111, 59, 0.18) 71%, transparent 72%);
}

.location-picker__dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #bf2f31;
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.4), 0 12px 22px rgba(0, 0, 0, 0.22);
  transform: translate(-50%, -50%);
}

.location-picker__zone {
  position: absolute;
  left: var(--x);
  top: var(--y);
  transform: translate(-50%, -50%);
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  font-size: 0.74rem;
  font-weight: 800;
}

.location-picker__controls {
  display: grid;
  gap: 0.85rem;
}

.location-picker__summary {
  display: grid;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
}

.location-picker__summary span,
.location-picker__summary strong {
  display: block;
}

@media (min-width: 720px) {
  .location-picker__controls,
  .location-picker__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .location-picker__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
