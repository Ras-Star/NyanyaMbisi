import { launchZones, deliveryBands, platformFeeUgx } from "../../shared/service-areas";
import type { DeliveryQuote, MapPin, SupplierStorefront } from "../../shared/types";

const supplierCoordinates: Record<string, MapPin> = {
  "sup-neema": { lat: 0.3761, lng: 32.7769, zoneId: "namilyango" },
  "sup-kibuuka": { lat: 0.3569, lng: 32.7794, zoneId: "gwafu" },
  "sup-sunrise": { lat: 0.3898, lng: 32.8031, zoneId: "njerere" }
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineKm(pointA: MapPin, pointB: MapPin) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(pointB.lat - pointA.lat);
  const deltaLng = toRadians(pointB.lng - pointA.lng);
  const latA = toRadians(pointA.lat);
  const latB = toRadians(pointB.lat);

  const chord =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2) * Math.cos(latA) * Math.cos(latB);
  const angle = 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));

  return earthRadiusKm * angle;
}

export function resolveZone(pin: MapPin | null) {
  if (!pin) {
    return null;
  }

  return (
    launchZones.find((zone) => haversineKm(zone.center, pin) <= zone.coverageKm) ??
    launchZones
      .map((zone) => ({ zone, distance: haversineKm(zone.center, pin) }))
      .sort((left, right) => left.distance - right.distance)[0]?.zone ??
    null
  );
}

export function buildDeliveryQuote({
  supplier,
  pin,
  subtotalUgx
}: {
  supplier: SupplierStorefront;
  pin: MapPin | null;
  subtotalUgx: number;
}): DeliveryQuote {
  const reasons: string[] = [];
  const zone = resolveZone(pin);

  if (!pin || !zone) {
    reasons.push("Delivery pin is missing.");
    return {
      distanceKm: 0,
      deliveryFeeUgx: 0,
      platformFeeUgx,
      subtotalUgx,
      totalUgx: subtotalUgx + platformFeeUgx,
      serviceable: false,
      zoneName: "Unavailable",
      reasons
    };
  }

  const supplierPoint = supplierCoordinates[supplier.id];

  if (!supplierPoint) {
    reasons.push("Supplier coordinates are unavailable.");
    return {
      distanceKm: 0,
      deliveryFeeUgx: 0,
      platformFeeUgx,
      subtotalUgx,
      totalUgx: subtotalUgx + platformFeeUgx,
      serviceable: false,
      zoneName: zone.name,
      reasons
    };
  }

  const distanceKm = Number(haversineKm(supplierPoint, pin).toFixed(1));
  const insideLaunchZone = haversineKm(zone.center, pin) <= zone.coverageKm;
  const band = deliveryBands.find((entry) => distanceKm <= entry.maxKm);

  if (!insideLaunchZone) {
    reasons.push("This delivery pin is outside the active launch zones.");
  }

  if (!band) {
    reasons.push("Delivery distance is above the current 8 km limit.");
  }

  const deliveryFeeUgx = insideLaunchZone && band ? band.feeUgx : 0;
  const serviceable = Boolean(insideLaunchZone && band);

  return {
    distanceKm,
    deliveryFeeUgx,
    platformFeeUgx,
    subtotalUgx,
    totalUgx: subtotalUgx + deliveryFeeUgx + platformFeeUgx,
    serviceable,
    zoneName: zone.name,
    reasons
  };
}
