import type { Position } from "@/entities/position/types";

export function assertInvariants(positions: Position[], available: bigint): void {
  if (!import.meta.env.DEV) return; // stripped from production builds

  for (const p of positions) {
    // I1: accrued is never negative
    if (p.accrued < 0n) fail("I1 accrued < 0", p);
    // I2: assets are positive for any held position (zeroed ones are removed)
    if (p.assets <= 0n) fail("I2 assets <= 0 for a held position", p);
    // I3: principal never exceeds current assets (can't have withdrawn more than in)
    if (p.principal > p.assets) fail("I3 principal > assets", p);
  }
  // I4: available balance is never negative
  if (available < 0n) fail("I4 available < 0", { available: available.toString() });
}

function fail(rule: string, ctx: unknown): void {
  console.error(`[INVARIANT VIOLATED] ${rule}`, ctx);
  throw new Error(`Invariant violated: ${rule}`);
}
