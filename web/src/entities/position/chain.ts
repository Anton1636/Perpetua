import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { readUserPositionsOnChain } from "@/shared/web3/reads";

// Reads the connected wallet's on-chain positions + available balances.
// Replaces the mock Zustand data as the source of truth once connected.
export function useOnChainPositions() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["positions", "onchain", address],
    queryFn: () => readUserPositionsOnChain(address!),
    enabled: !!address,
    staleTime: 10_000,
  });
}
