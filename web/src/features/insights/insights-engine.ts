import { toNumber, formatUsdNumber, formatPct } from "@/shared/lib/format";

export type InsightSeverity = "opportunity" | "warning" | "info";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  actionLabel?: string;
  actionVault?: `0x${string}`;
}

export interface VaultSnapshot {
  symbol: string;
  address: `0x${string}`;
  apy: number;
}

export interface InsightInput {
  positions: { vaultAddress: `0x${string}`; assets: bigint }[];
  balances: { vaultAddress: `0x${string}`; symbol: string; walletBalance: bigint }[];
  vaults: VaultSnapshot[];
  pendingYields: Record<string, bigint>;
}

const MIN_IDLE_USD = 100;
const MIN_YIELD_USD = 1;
const CONCENTRATION_THRESHOLD = 0.6;

/** Idle tokens earn nothing - point at the highest-value staking opportunity. */
export function idleCapitalInsights({ balances, vaults }: InsightInput): Insight[] {
  const candidates = balances
    .filter((b) => b.walletBalance > 0n)
    .map((b) => ({ balance: b, vault: vaults.find((v) => v.address === b.vaultAddress) }))
    .filter(
      (c): c is { balance: InsightInput["balances"][number]; vault: VaultSnapshot } => !!c.vault,
    );

  if (candidates.length === 0) return [];

  // rank by expected yield (amount × apy), not raw balance
  const best = candidates.reduce((a, b) =>
    toNumber(b.balance.walletBalance) * b.vault.apy >
    toNumber(a.balance.walletBalance) * a.vault.apy
      ? b
      : a,
  );

  const amount = toNumber(best.balance.walletBalance);
  if (amount < MIN_IDLE_USD) return [];

  return [
    {
      id: "idle-capital",
      severity: "opportunity",
      title: `${formatUsdNumber(amount)} of ${best.vault.symbol} sitting idle`,
      detail: `Staking it at ${formatPct(best.vault.apy)} APY would earn about ${formatUsdNumber(amount * best.vault.apy)} in the first year.`,
      actionLabel: `Stake ${best.vault.symbol}`,
      actionVault: best.vault.address,
    },
  ];
}

/** Yield accrued in the source but not yet pulled into the vault. */
export function unharvestedYieldInsights({
  positions,
  vaults,
  pendingYields,
}: InsightInput): Insight[] {
  const out: Insight[] = [];

  for (const p of positions) {
    const pending = pendingYields[p.vaultAddress.toLowerCase()] ?? 0n;
    if (toNumber(pending) < MIN_YIELD_USD) continue;

    const vault = vaults.find((v) => v.address === p.vaultAddress);
    out.push({
      id: `harvest-${p.vaultAddress}`,
      severity: "opportunity",
      title: `${formatUsdNumber(toNumber(pending))} ready to harvest`,
      detail: `${vault?.symbol ?? "This vault"} has unharvested yield. A harvest streams it into the share price over the following 8 hours.`,
      actionLabel: "Harvest",
      actionVault: p.vaultAddress,
    });
  }
  return out;
}

/** Single-vault exposure is single-issuer risk. */
export function concentrationInsights({ positions, vaults }: InsightInput): Insight[] {
  const total = positions.reduce((s, p) => s + p.assets, 0n);
  if (total === 0n || positions.length < 2) return [];

  const largest = positions.reduce((a, b) => (b.assets > a.assets ? b : a));
  const share = toNumber(largest.assets) / toNumber(total);
  if (share < CONCENTRATION_THRESHOLD) return [];

  const vault = vaults.find((v) => v.address === largest.vaultAddress);
  return [
    {
      id: "concentration",
      severity: "warning",
      title: `${formatPct(share)} of your capital is in one vault`,
      detail: `${vault?.symbol ?? "One vault"} dominates your portfolio. Spreading across issuers reduces single-issuer exposure.`,
    },
  ];
}

export function buildInsights(input: InsightInput): Insight[] {
  return [
    ...unharvestedYieldInsights(input),
    ...idleCapitalInsights(input),
    ...concentrationInsights(input),
  ];
}
