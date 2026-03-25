export function useCurrency() {
  const numberFormatter = new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 0
  });

  function formatUGX(amount: number) {
    return `UGX ${numberFormatter.format(amount)}`;
  }

  function formatKm(distanceKm: number) {
    return `${distanceKm.toFixed(1)} km`;
  }

  return {
    formatUGX,
    formatKm
  };
}

