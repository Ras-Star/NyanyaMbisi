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
const geolocationActive = ref(false);
const geolocationError = ref("");
const currentLocation = ref<MapPin | null>(null);
const bounds = {
  latMin: 0.335,
  latMax: 0.405,
  lngMin: 32.752,
  lngMax: 32.818
};

const canUseGoogleMap = computed(() => Boolean(runtimeConfig.public.googleMapsApiKey));
const fallbackPin = props.modelValue ?? {
  lat: props.zones[0]?.center.lat ?? 0.3772,
  lng: props.zones[0]?.center.lng ?? 32.7746,
  zoneId: props.zones[0]?.id ?? "namilyango",
  source: "manual" as const
};

const draftPin = ref<MapPin>({ ...fallbackPin });
let geolocationWatchId: number | null = null;
let mapInstance: any;
let draftMarkerInstance: any;
let liveMarkerInstance: any;
let accuracyCircleInstance: any;
const { t } = useI18n();

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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
    lat: clamp(pin.lat, bounds.latMin, bounds.latMax),
    lng: clamp(pin.lng, bounds.lngMin, bounds.lngMax),
    zoneId: zone?.id ?? null
  };
}

function applyDraftPin(pin: MapPin, panMap = true) {
  draftPin.value = normalizePin(pin);
  updateMapVisuals(panMap);
}

function setDraftFromRatios(xRatio: number, yRatio: number) {
  const lat = bounds.latMax - (bounds.latMax - bounds.latMin) * yRatio;
  const lng = bounds.lngMin + (bounds.lngMax - bounds.lngMin) * xRatio;
  applyDraftPin({
    lat,
    lng,
    source: "manual",
    capturedAt: new Date().toISOString()
  });
}

function stopLiveLocation() {
  geolocationActive.value = false;

  if (import.meta.client && geolocationWatchId !== null) {
    navigator.geolocation.clearWatch(geolocationWatchId);
    geolocationWatchId = null;
  }
}

function confirmPin() {
  stopLiveLocation();
  emit("update:modelValue", {
    ...normalizePin(draftPin.value),
    confirmedAt: new Date().toISOString(),
    capturedAt: draftPin.value.capturedAt ?? new Date().toISOString()
  });
}

const confirmedPin = computed(() => (props.modelValue ? normalizePin(props.modelValue) : null));
const activeZoneName = computed(() => props.zones.find((zone) => zone.id === draftPin.value.zoneId)?.name ?? "—");
const geolocationAccuracy = computed(() =>
  draftPin.value.source === "geolocation" && typeof draftPin.value.accuracyMeters === "number"
    ? `${Math.round(draftPin.value.accuracyMeters)} m`
    : null
);

function handleFallbackClick(event: MouseEvent) {
  stopLiveLocation();
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const xRatio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const yRatio = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
  setDraftFromRatios(xRatio, yRatio);
}

const sliderLat = computed({
  get: () => draftPin.value.lat,
  set: (value: number | string) => {
    stopLiveLocation();
    applyDraftPin({
      ...draftPin.value,
      lat: Number(value),
      source: "manual",
      capturedAt: new Date().toISOString()
    });
  }
});

const sliderLng = computed({
  get: () => draftPin.value.lng,
  set: (value: number | string) => {
    stopLiveLocation();
    applyDraftPin({
      ...draftPin.value,
      lng: Number(value),
      source: "manual",
      capturedAt: new Date().toISOString()
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

function updateMapVisuals(panMap = false) {
  if (!googleReady.value || !mapInstance || !draftMarkerInstance) {
    return;
  }

  const draftPosition = { lat: draftPin.value.lat, lng: draftPin.value.lng };
  draftMarkerInstance.setPosition(draftPosition);

  if (panMap) {
    mapInstance.panTo(draftPosition);
  }

  if (currentLocation.value) {
    const currentPosition = { lat: currentLocation.value.lat, lng: currentLocation.value.lng };

    liveMarkerInstance?.setMap(mapInstance);
    liveMarkerInstance?.setPosition(currentPosition);
    accuracyCircleInstance?.setMap(mapInstance);
    accuracyCircleInstance?.setCenter(currentPosition);
    accuracyCircleInstance?.setRadius(currentLocation.value.accuracyMeters ?? 12);
  } else {
    liveMarkerInstance?.setMap(null);
    accuracyCircleInstance?.setMap(null);
  }
}

async function initGoogleMap() {
  if (!import.meta.client || !canUseGoogleMap.value || !mapElement.value) {
    return;
  }

  try {
    await loadGoogleMaps(runtimeConfig.public.googleMapsApiKey);

    mapInstance = new window.google.maps.Map(mapElement.value, {
      center: { lat: draftPin.value.lat, lng: draftPin.value.lng },
      zoom: 14,
      disableDefaultUI: true,
      clickableIcons: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] }
      ]
    });

    draftMarkerInstance = new window.google.maps.Marker({
      map: mapInstance,
      position: { lat: draftPin.value.lat, lng: draftPin.value.lng },
      draggable: true
    });

    liveMarkerInstance = new window.google.maps.Marker({
      map: null,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: "#1d6f3b",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
        scale: 7
      }
    });

    accuracyCircleInstance = new window.google.maps.Circle({
      map: null,
      strokeColor: "#1d6f3b",
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: "#1d6f3b",
      fillOpacity: 0.12
    });

    mapInstance.addListener("click", (event: any) => {
      stopLiveLocation();
      applyDraftPin({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        source: "manual",
        capturedAt: new Date().toISOString()
      });
    });

    draftMarkerInstance.addListener("dragstart", () => {
      stopLiveLocation();
    });

    draftMarkerInstance.addListener("dragend", (event: any) => {
      applyDraftPin({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        source: "manual",
        capturedAt: new Date().toISOString()
      });
    });

    googleReady.value = true;
    updateMapVisuals(true);
  } catch {
    googleFailed.value = true;
  }
}

function setLiveLocation(position: GeolocationPosition) {
  const nextPin = normalizePin({
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    source: "geolocation",
    capturedAt: new Date().toISOString(),
    accuracyMeters: position.coords.accuracy
  });

  currentLocation.value = nextPin;
  draftPin.value = nextPin;
  geolocationError.value = "";
  updateMapVisuals(true);
}

function startLiveLocation() {
  if (!import.meta.client || !navigator.geolocation) {
    geolocationError.value = t("location.geolocationUnavailable");
    return;
  }

  geolocationError.value = "";
  geolocationActive.value = true;

  if (geolocationWatchId !== null) {
    return;
  }

  geolocationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      setLiveLocation(position);
    },
    (error) => {
      stopLiveLocation();
      geolocationError.value =
        error.code === error.PERMISSION_DENIED ? t("location.geolocationDenied") : t("location.geolocationUnavailable");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    }
  );
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      draftPin.value = { ...normalizePin(value) };
      updateMapVisuals(true);
    }
  },
  { deep: true }
);

onMounted(() => {
  if (canUseGoogleMap.value) {
    void initGoogleMap();
  }
});

onBeforeUnmount(() => {
  stopLiveLocation();
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

    <div v-if="canUseGoogleMap" ref="mapElement" class="location-picker__map"></div>

    <button v-else type="button" class="location-picker__fallback" @click="handleFallbackClick">
      <div class="location-picker__backdrop"></div>
      <div
        v-if="confirmedPin"
        class="location-picker__dot location-picker__dot--confirmed"
        :style="{
          left: `${((confirmedPin.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100}%`,
          top: `${((bounds.latMax - confirmedPin.lat) / (bounds.latMax - bounds.latMin)) * 100}%`
        }"
      ></div>
      <div
        v-if="currentLocation"
        class="location-picker__dot location-picker__dot--live"
        :style="{
          left: `${((currentLocation.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100}%`,
          top: `${((bounds.latMax - currentLocation.lat) / (bounds.latMax - bounds.latMin)) * 100}%`
        }"
      ></div>
      <div
        class="location-picker__dot"
        :style="{
          left: `${((draftPin.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100}%`,
          top: `${((bounds.latMax - draftPin.lat) / (bounds.latMax - bounds.latMin)) * 100}%`
        }"
      ></div>
      <span
        v-for="zone in zones"
        :key="zone.id"
        class="location-picker__zone"
        :style="{ '--x': `${((zone.center.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100}%`, '--y': `${((bounds.latMax - zone.center.lat) / (bounds.latMax - bounds.latMin)) * 100}%` }"
      >
        {{ zone.name }}
      </span>
    </button>

    <div class="location-picker__actions">
      <button
        type="button"
        class="btn"
        :class="geolocationActive ? 'btn--secondary' : 'btn--primary'"
        @click="geolocationActive ? stopLiveLocation() : startLiveLocation()"
      >
        {{ geolocationActive ? t("location.stopLive") : t("location.useLive") }}
      </button>
      <span v-if="geolocationAccuracy" class="muted">{{ t("location.accuracy") }}: {{ geolocationAccuracy }}</span>
    </div>

    <p v-if="googleFailed" class="muted">{{ t("location.unavailable") }}</p>
    <p v-if="geolocationError" class="muted">{{ geolocationError }}</p>

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
  background:
    linear-gradient(180deg, rgba(29, 111, 59, 0.16), rgba(151, 212, 142, 0.1)),
    radial-gradient(circle at 16% 18%, rgba(255, 255, 255, 0.38), transparent 22%),
    linear-gradient(135deg, rgba(244, 196, 48, 0.22), rgba(255, 255, 255, 0.22));
}

.location-picker__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 24% 34%, rgba(255, 255, 255, 0.54), transparent 18%),
    radial-gradient(circle at 68% 62%, rgba(255, 255, 255, 0.42), transparent 16%);
}

.location-picker__dot {
  --size: 18px;
  position: absolute;
  width: var(--size);
  height: var(--size);
  margin-left: calc(var(--size) / -2);
  margin-top: calc(var(--size) / -2);
  border-radius: 999px;
  background: var(--brand-sun);
  box-shadow: 0 0 0 8px rgba(244, 196, 48, 0.24);
}

.location-picker__dot--live {
  --size: 14px;
  background: var(--brand-leaf);
  box-shadow: 0 0 0 10px rgba(29, 111, 59, 0.16);
}

.location-picker__dot--confirmed {
  --size: 22px;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid var(--brand-earth);
  box-shadow: none;
}

.location-picker__zone {
  position: absolute;
  left: var(--x);
  top: var(--y);
  transform: translate(-50%, -50%);
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-sm);
  font-size: 0.76rem;
  font-weight: 800;
}

.location-picker__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}

.location-picker__controls {
  display: grid;
  gap: 0.85rem;
}

.location-picker__summary {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.location-picker__summary span,
.location-picker__summary strong {
  display: block;
}

@media (max-width: 640px) {
  .location-picker__summary {
    grid-template-columns: 1fr;
  }
}
</style>
