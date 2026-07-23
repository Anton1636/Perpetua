import { useQuery } from "@tanstack/react-query";
import { readUserPositionsOnChain } from "@/shared/web3/reads";
import { useViewedAddress } from "@/features/watch/useViewedAddress";

// Reads whichever address is being viewed — the connected wallet by default,
// or a watched address in watch-only mode.
export function useOnChainPositions() {
  const { address } = useViewedAddress();

  return useQuery({
    queryKey: ["positions", "onchain", address],
    queryFn: () => readUserPositionsOnChain(address!),
    enabled: !!address,
    staleTime: 10_000,
  });
}
