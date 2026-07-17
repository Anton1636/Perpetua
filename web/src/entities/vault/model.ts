import { useQuery } from "@tanstack/react-query";
import type { Vault } from "./types";
import { MOCK_VAULTS } from "./mock";
import { readVaultsOnChain } from "@/shared/web3/reads";
import { apy, baseYield } from "@/shared/lib/vault-math";

// THE SEAM, now resolved on-chain. Vault metadata (name, yields, risk) stays in
// the mock (it's protocol config, not on-chain state), but TVL + share price now
// come from the deployed contracts via multicall. Components are unchanged.
async function fetchVaults(): Promise<Vault[]> {
  const onChain = await readVaultsOnChain();
  return MOCK_VAULTS.map((mock) => {
    const live = onChain.find((o) => o.symbol === mock.symbol);
    return {
      ...mock,
      tvl: live?.tvl ?? mock.tvl,
      pricePerShare: live?.pricePerShare ?? mock.pricePerShare,
    };
  });
}

export function useVaults() {
  return useQuery({
    queryKey: ["vaults", "onchain"],
    queryFn: fetchVaults,
    staleTime: 15_000,
  });
}

export function vaultApy(v: Vault): number {
  return apy(baseYield(v.dividendPct, v.stakingPct));
}
