import type { PaymentProvider } from "./types";

const UGANDA_MTN_PREFIXES = new Set(["076", "077", "078", "079"]);
const UGANDA_AIRTEL_PREFIXES = new Set(["070", "074", "075"]);

function extractUgandanLocalPrefix(normalized: string) {
  return normalized.startsWith("+256") ? `0${normalized.slice(4, 6)}` : "";
}

function isSupportedNormalizedUgandanNumber(normalized: string) {
  const prefix = extractUgandanLocalPrefix(normalized);
  return UGANDA_MTN_PREFIXES.has(prefix) || UGANDA_AIRTEL_PREFIXES.has(prefix);
}

export function getUgandanMobileProvider(input: string): PaymentProvider | null {
  const normalized = normalizePhoneNumber(input);

  if (!normalized) {
    return null;
  }

  const prefix = extractUgandanLocalPrefix(normalized);

  if (UGANDA_MTN_PREFIXES.has(prefix)) {
    return "mtn";
  }

  if (UGANDA_AIRTEL_PREFIXES.has(prefix)) {
    return "airtel";
  }

  return null;
}

export function isSupportedUgandanMobileNumber(input: string) {
  return Boolean(getUgandanMobileProvider(input));
}

export function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();
  const compact = trimmed.replace(/[\s()-]/g, "");

  if (!compact) {
    return "";
  }

  if (compact.startsWith("+")) {
    const normalized = `+${compact.slice(1).replace(/\D/g, "")}`;
    return /^\+256\d{9}$/.test(normalized) && isSupportedNormalizedUgandanNumber(normalized) ? normalized : "";
  }

  const numeric = compact.replace(/\D/g, "");

  if (/^0\d{9}$/.test(numeric)) {
    const normalized = `+256${numeric.slice(1)}`;
    return isSupportedNormalizedUgandanNumber(normalized) ? normalized : "";
  }

  return "";
}
