import { formatUnits, parseUnits } from "viem";

// All on-chain amounts are bigint in 18-decimal base units (wei). Human-facing
// formatting happens ONLY here, at the edge — never in components or math.

export const DECIMALS = 18;

/** bigint wei -> Number (use only for display/chart math, never store back on-chain). */
export function toNumber(wei: bigint, decimals = DECIMALS): number {
  return Number(formatUnits(wei, decimals));
}

/** human string/number -> bigint wei (e.g. "5000" -> 5000e18). */
export function toWei(value: string | number, decimals = DECIMALS): bigint {
  return parseUnits(String(value), decimals);
}

/** bigint wei -> "$1,234.56" */
export function formatUsd(wei: bigint, decimals = DECIMALS): string {
  return `$${toNumber(wei, decimals).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** bigint wei -> "$1,234.567890" (extra precision for live-accruing figures) */
export function formatUsdPrecise(wei: bigint, dp = 6, decimals = DECIMALS): string {
  return `$${toNumber(wei, decimals).toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })}`;
}

/** fraction (0.086) -> "8.60%" */
export function formatPct(fraction: number): string {
  return `${(fraction * 100).toFixed(2)}%`;
}

/** compact axis label: 12_500 -> "$12.5k", 1_200_000 -> "$1.2m" */
export function formatCompact(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}m`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}k`;
  return `$${Math.round(n)}`;
}

/** plain number -> "$1,234.56" (display-only path, no bigint round-trip). */
export function formatUsdNumber(n: number, dp = 2): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}
