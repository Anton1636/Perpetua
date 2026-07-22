import { useQuery } from "@tanstack/react-query";
import type { Vault } from "./types";
import { MOCK_VAULTS } from "./mock";
import { readVaultsOnChain } from "@/shared/web3/reads";
import { vaultBySymbol } from "@/shared/web3/addresses";
import { apy, baseYield } from "@/shared/lib/vault-math";

// Vault metadata (name, yields, risk, tag) stays local — it's protocol config,
// not chain state. Everything identity- and money-related comes from the chain.
async function fetchVaults(): Promise<Vault[]> {
  const onChain = await readVaultsOnChain();

  return MOCK_VAULTS.map((meta) => {
    const deployment = vaultBySymbol(meta.symbol);
    const live = onChain.find((o) => o.symbol === meta.symbol);

    return {
      ...meta,
      // CRITICAL: the address MUST be the deployed vault address. On-chain
      // positions are keyed by it, so a stale mock address here silently breaks
      // every position lookup (blended APY read 0.00%, cards showed no stake).
      address: deployment?.vault ?? meta.address,
      tvl: live?.tvl ?? 0n,
      pricePerShare: live?.pricePerShare ?? meta.pricePerShare,
    };
  });
}

export function useVaults() {
  return useQuery({ queryKey: ["vaults", "onchain"], queryFn: fetchVaults, staleTime: 15_000 });
}

export function vaultApy(v: Vault): number {
  return apy(baseYield(v.dividendPct, v.stakingPct));
}
