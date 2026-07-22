import type { Vault } from "@/entities/vault/types";
import type { Position } from "@/entities/position/types";
import { toNumber } from "./format";

const RISK_WEIGHT = { low: 1, medium: 2 } as const;

export interface RiskProfile {
  score: number; // 1.0 (all low risk) .. 2.0 (all medium risk)
  label: string;
  color: string;
}

/** Allocation-weighted risk of the portfolio, not a naive average of vaults. */
export function riskProfile(positions: Position[], vaults: Vault[]): RiskProfile | null {
  const total = positions.reduce((s, p) => s + p.assets, 0n);
  if (total === 0n) return null;

  let weighted = 0;
  const totalNum = toNumber(total);
  for (const p of positions) {
    const v = vaults.find((x) => x.address === p.vaultAddress);
    if (v) weighted += toNumber(p.assets) * RISK_WEIGHT[v.risk];
  }
  const score = weighted / totalNum;

  if (score < 1.34) return { score, label: "Conservative", color: "var(--c-lume)" };
  if (score < 1.67) return { score, label: "Balanced", color: "var(--c-cream)" };
  return { score, label: "Growth", color: "var(--c-amber)" };
}
