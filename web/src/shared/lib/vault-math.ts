// Pure vault math. No React, no formatting. Kept separate so it can be unit
// tested in isolation (see vault-math.test.ts) and reused by the real contract
// integration later.

/** Nominal annual yield as a fraction, e.g. dividend 5.5% + staking 2.8% -> 0.083 */
export function baseYield(dividendPct: number, stakingPct: number): number {
  return (dividendPct + stakingPct) / 100;
}

/** APY from nominal yield with daily compounding (DRIP). 0.083 -> ~0.0866 */
export function apy(baseYieldFraction: number, periodsPerYear = 365): number {
  return Math.pow(1 + baseYieldFraction / periodsPerYear, periodsPerYear) - 1;
}

/**
 * ERC-4626 conversions. exchangeRate = totalAssets / totalShares, scaled so that
 * 1e18 means "1 asset per share". Mirrors how the vault contract will price shares.
 */
export function sharesToAssets(shares: bigint, totalAssets: bigint, totalShares: bigint): bigint {
  if (totalShares === 0n) return shares; // 1:1 on an empty vault
  return (shares * totalAssets) / totalShares;
}

export function assetsToShares(assets: bigint, totalAssets: bigint, totalShares: bigint): bigint {
  if (totalAssets === 0n) return assets; // 1:1 on an empty vault
  return (assets * totalShares) / totalAssets;
}

/**
 * Compound projection for the calculator. Works in plain numbers (display only).
 * Returns yearly points comparing reinvested (DRIP) vs dividends-taken-as-cash.
 */
export function projection(
  principal: number,
  years: number,
  apyFraction: number,
  baseYieldFraction: number,
): { year: number; compounded: number; simple: number }[] {
  const out = [];
  for (let y = 0; y <= years; y++) {
    out.push({
      year: y,
      compounded: principal * Math.pow(1 + apyFraction, y),
      simple: principal * (1 + baseYieldFraction * y),
    });
  }
  return out;
}
