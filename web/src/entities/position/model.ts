import { useQuery } from "@tanstack/react-query";
import type { Position } from "./types";
import { MOCK_POSITIONS } from "./mock";
import { useVaults, vaultApy } from "@/entities/vault/model";
import { toNumber } from "@/shared/lib/format";

async function fetchPositions(): Promise<Position[]> {
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_POSITIONS;
}

export function usePositions() {
  return useQuery({ queryKey: ["positions"], queryFn: fetchPositions });
}

/** Portfolio-level totals derived from positions + vault APYs. */
export function usePortfolioTotals() {
  const { data: positions } = usePositions();
  const { data: vaults } = useVaults();

  if (!positions || !vaults) {
    return { staked: 0n, accrued: 0n, blendedApy: 0, count: 0 };
  }

  const staked = positions.reduce((sum, p) => sum + p.shares, 0n);
  const accrued = positions.reduce((sum, p) => sum + p.accrued, 0n);

  // blended APY weighted by staked amount (weights in plain numbers, at the edge)
  let weighted = 0;
  const totalNum = toNumber(staked);
  for (const p of positions) {
    const v = vaults.find((x) => x.address === p.vaultAddress);
    if (v) weighted += toNumber(p.shares) * vaultApy(v);
  }
  const blendedApy = totalNum > 0 ? weighted / totalNum : 0;

  return { staked, accrued, blendedApy, count: positions.length };
}
