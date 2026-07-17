import type { Position } from "./types";
import { useOnChainPositions } from "./chain";
import { useVaults, vaultApy } from "@/entities/vault/model";
import { toNumber } from "@/shared/lib/format";

// Positions now come from the chain (via useOnChainPositions) when a wallet is
// connected. Falls back to empty when disconnected.
export function usePositions(): Position[] {
  const { data } = useOnChainPositions();
  if (!data) return [];
  return data
    .filter((p) => p.assets > 0n)
    .map((p) => ({
      vaultAddress: p.vaultAddress,
      assets: p.assets,
      principal: p.assets, // on-chain we don't track cost basis yet (Day 22: from events)
      accrued: 0n, // yield is reflected in share price, not a separate figure now
    }));
}

// Total available to stake = sum of wallet token balances across all vaults.
export function useAvailable(): bigint {
  const { data } = useOnChainPositions();
  if (!data) return 0n;
  return data.reduce((sum, p) => sum + p.walletBalance, 0n);
}

export function usePortfolioTotals() {
  const positions = usePositions();
  const { data: vaults } = useVaults();

  if (!vaults) return { staked: 0n, accrued: 0n, blendedApy: 0, count: 0 };

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
