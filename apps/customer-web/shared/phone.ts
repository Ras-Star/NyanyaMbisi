export function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();
  const digits = trimmed.replace(/[^\d+]/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("+")) {
    const normalized = `+${digits.slice(1).replace(/\D/g, "")}`;
    return /^\+\d{8,15}$/.test(normalized) ? normalized : "";
  }

  const numeric = digits.replace(/\D/g, "");

  if (numeric.startsWith("0") && numeric.length === 10) {
    return `+256${numeric.slice(1)}`;
  }

  if (numeric.startsWith("256") && numeric.length === 12) {
    return `+${numeric}`;
  }

  if (numeric.length >= 8 && numeric.length <= 15) {
    return `+${numeric}`;
  }

  return "";
}
