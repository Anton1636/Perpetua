import { useQuery } from "@tanstack/react-query";
import { useOnChainPositions } from "@/entities/position/chain";
import { useVaults, vaultApy } from "@/entities/vault/model";
import { readPendingYields } from "@/shared/web3/reads";
import { buildInsights, type Insight, type VaultSnapshot } from "./insights-engine";

export function useInsights(): Insight[] {
  const { data: positions } = useOnChainPositions();
  const { data: vaults } = useVaults();
  const { data: pendingYields } = useQuery({
    queryKey: ["pendingYields"],
    queryFn: readPendingYields,
    staleTime: 30_000,
  });

  if (!positions || !vaults) return [];

  const snapshots: VaultSnapshot[] = vaults.map((v) => ({
    symbol: v.symbol,
    address: v.address,
    apy: vaultApy(v),
  }));

  return buildInsights({
    positions: positions
      .filter((p) => p.assets > 0n)
      .map((p) => ({ vaultAddress: p.vaultAddress, assets: p.assets })),
    balances: positions.map((p) => ({
      vaultAddress: p.vaultAddress,
      symbol: p.symbol,
      walletBalance: p.walletBalance,
    })),
    vaults: snapshots,
    pendingYields: pendingYields ?? {},
  });
}
