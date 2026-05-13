// Format large numbers with sensible units: 7,000,000,000 -> "7B", 7,500,000,000 -> "7.5B",
// 500,000,000 -> "500M", 1,250,000 -> "1.25M", 100,000 -> "100k".
export function formatBigNumber(value: number): string {
  if (!isFinite(value)) return '0';
  if (value === 0) return '0';

  const abs = Math.abs(value);
  let scaled: number;
  let suffix: string;

  if (abs >= 1e9) {
    scaled = value / 1e9;
    suffix = 'B';
  } else if (abs >= 1e6) {
    scaled = value / 1e6;
    suffix = 'M';
  } else if (abs >= 1e3) {
    scaled = value / 1e3;
    suffix = 'k';
  } else {
    return Math.round(value).toString();
  }

  const absScaled = Math.abs(scaled);
  const dp = absScaled >= 100 ? 0 : absScaled >= 10 ? 1 : 2;
  // parseFloat trims trailing zeros: "7.00" -> "7", "7.50" -> "7.5"
  return parseFloat(scaled.toFixed(dp)) + suffix;
}

export function formatPerDay(value: number): string {
  return `${formatBigNumber(value)}/day`;
}

// Currency: small values get cents ($1.20, $0.50); large values use formatBigNumber ($500M, $2.39B).
export function formatCurrency(value: number): string {
  if (!isFinite(value)) return '$0';
  const abs = Math.abs(value);
  if (abs < 1000) {
    return `$${value.toFixed(2)}`;
  }
  return `$${formatBigNumber(value)}`;
}
