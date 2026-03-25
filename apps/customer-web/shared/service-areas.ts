import type { LaunchZone } from "./types";

export const platformFeeUgx = 1500;

export const launchZones: LaunchZone[] = [
  {
    id: "namilyango",
    name: "Namilyango",
    slug: "namilyango",
    description: "Campus-side households, fresh produce stops, and quick household baskets.",
    center: { lat: 0.3772, lng: 32.7746, zoneId: "namilyango" },
    coverageKm: 3.4,
    accent: "var(--brand-leaf)"
  },
  {
    id: "gwafu",
    name: "Gwafu",
    slug: "gwafu",
    description: "Fast-moving staples and butcher deliveries around the trading center.",
    center: { lat: 0.3551, lng: 32.7773, zoneId: "gwafu" },
    coverageKm: 3.1,
    accent: "var(--brand-sun)"
  },
  {
    id: "njerere",
    name: "Njerere",
    slug: "njerere",
    description: "Family groceries and weekly top-ups for the eastern edge of the launch.",
    center: { lat: 0.3926, lng: 32.8042, zoneId: "njerere" },
    coverageKm: 3.6,
    accent: "var(--brand-mint)"
  }
];

export const deliveryBands = [
  { maxKm: 2, feeUgx: 2000 },
  { maxKm: 5, feeUgx: 4000 },
  { maxKm: 8, feeUgx: 6000 }
] as const;

