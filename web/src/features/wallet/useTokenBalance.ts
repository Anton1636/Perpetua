import { useReadContract, useAccount } from "wagmi";
import { mockEquityTokenAbi } from "@/shared/web3/generated";
import type { VaultDeployment } from "@/shared/web3/addresses";

// This is the FIRST real on-chain read — proof the frontend talks to the
// deployed contracts. Returns balance in wei (bigint) + loading state.
export function useTokenBalance(deployment: VaultDeployment) {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: deployment.token,
    abi: mockEquityTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return { balance: (data as bigint) ?? 0n, isLoading, refetch };
}
