import type { Position } from "./types";
import { usePositionStore } from "./store";
import { useVaults, vaultApy } from "@/entities/vault/model";
import { toNumber } from "@/shared/lib/format";

export function usePositions(): Position[] {
  return usePositionStore((s) => s.positions);
}

export function usePortfolioTotals() {
  const positions = usePositions();
  const { data: vaults } = useVaults();

  if (!vaults) return { staked: 0n, accrued: 0n, blendedApy: 0, count: 0 };

  // honest units: staked is a sum of ASSETS (wei), not shares
  const staked = positions.reduce((sum, p) => sum + p.assets, 0n);
  const accrued = positions.reduce((sum, p) => sum + p.accrued, 0n);

  let weighted = 0;
  const totalNum = toNumber(staked);
  for (const p of positions) {
    const v = vaults.find((x) => x.address === p.vaultAddress);
    if (v) weighted += toNumber(p.assets) * vaultApy(v);
  }
  const blendedApy = totalNum > 0 ? weighted / totalNum : 0;

  return { staked, accrued, blendedApy, count: positions.length };
}
