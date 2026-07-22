import { toNumber } from "@/shared/lib/format";

export interface PnLInput {
  currentValue: bigint; // what the position is worth right now (assets, wei)
  totalDeposited: bigint; // lifetime deposits (from indexed events)
  totalWithdrawn: bigint; // lifetime withdrawals (from indexed events)
}

export interface PnLResult {
  pnl: bigint; // absolute profit/loss in assets (wei)
  pnlPct: number; // fraction, e.g. 0.083 = +8.3%
  costBasis: bigint; // net capital still at work
}

/**
 * Profit = what you hold now + what you already took out − what you put in.
 * Works purely from indexed events, so it survives refreshes and is identical
 * across devices (unlike a locally-tracked cost basis).
 */
export function computePnL({ currentValue, totalDeposited, totalWithdrawn }: PnLInput): PnLResult {
  const pnl = currentValue + totalWithdrawn - totalDeposited;
  const costBasis = totalDeposited > totalWithdrawn ? totalDeposited - totalWithdrawn : 0n;
  const base = toNumber(totalDeposited);
  const pnlPct = base > 0 ? toNumber(pnl) / base : 0;
  return { pnl, pnlPct, costBasis };
}

export interface HistoryPoint {
  timestamp: number; // seconds
  invested: number; // cumulative net invested, in display units
}

/** Builds a step timeline of net invested capital from the event ledger. */
export function buildHistory(
  events: { kind: string; amount: bigint; timestamp: number }[],
): HistoryPoint[] {
  let running = 0n;
  const points: HistoryPoint[] = [];
  for (const e of events) {
    if (e.kind === "STAKE" || e.kind === "ZAP") running += e.amount;
    else if (e.kind === "UNSTAKE") running -= e.amount;
    else continue; // harvests don't change invested capital
    points.push({ timestamp: e.timestamp, invested: toNumber(running < 0n ? 0n : running) });
  }
  return points;
}
