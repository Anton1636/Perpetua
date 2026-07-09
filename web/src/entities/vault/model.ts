import { useQuery } from "@tanstack/react-query";
import type { Vault } from "./types";
import { MOCK_VAULTS } from "./mock";
import { apy, baseYield } from "@/shared/lib/vault-math";

// THE SEAM. Today this resolves a mock;
// Everything downstream (components) depends on this hook, not the mock.
async function fetchVaults(): Promise<Vault[]> {
  // simulate async so loading states are real
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_VAULTS;
}

export function useVaults() {
  return useQuery({ queryKey: ["vaults"], queryFn: fetchVaults });
}

/** Derived helper: APY as a fraction for a given vault. */
export function vaultApy(v: Vault): number {
  return apy(baseYield(v.dividendPct, v.stakingPct));
}
