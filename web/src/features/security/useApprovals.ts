import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { readContracts } from "wagmi/actions";
import { wagmiConfig } from "@/shared/web3/config";
import { mockEquityTokenAbi } from "@/shared/web3/generated";
import { VAULTS, CONTRACTS } from "@/shared/web3/addresses";

export interface Approval {
  symbol: string;
  token: `0x${string}`;
  spender: `0x${string}`;
  spenderLabel: string;
  allowance: bigint;
}

// Reads how much each token the connected wallet has approved to the vault and
// the zap router. Surfacing (and letting users revoke) approvals is a core
// safety feature real DeFi frontends often skip.
export function useApprovals() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["approvals", address],
    enabled: !!address,
    staleTime: 15_000,
    queryFn: async (): Promise<Approval[]> => {
      // for each token: allowance(owner, vault) and allowance(owner, zapRouter)
      const calls = VAULTS.flatMap((v) => [
        {
          address: v.token,
          abi: mockEquityTokenAbi,
          functionName: "allowance",
          args: [address!, v.vault],
        } as const,
        {
          address: v.token,
          abi: mockEquityTokenAbi,
          functionName: "allowance",
          args: [address!, CONTRACTS.zapRouter],
        } as const,
      ]);
      const results = await readContracts(wagmiConfig, { contracts: calls });

      const approvals: Approval[] = [];
      VAULTS.forEach((v, i) => {
        const vaultAllowance = (results[i * 2]?.result as bigint) ?? 0n;
        const zapAllowance = (results[i * 2 + 1]?.result as bigint) ?? 0n;
        if (vaultAllowance > 0n) {
          approvals.push({
            symbol: v.symbol,
            token: v.token,
            spender: v.vault,
            spenderLabel: `${v.symbol} Vault`,
            allowance: vaultAllowance,
          });
        }
        if (zapAllowance > 0n) {
          approvals.push({
            symbol: v.symbol,
            token: v.token,
            spender: CONTRACTS.zapRouter,
            spenderLabel: "Zap Router",
            allowance: zapAllowance,
          });
        }
      });
      return approvals;
    },
  });
}
