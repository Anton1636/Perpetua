import { useWriteContract, usePublicClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { mockEquityTokenAbi } from "@/shared/web3/generated";
import { useToast } from "@/shared/ui";
import type { VaultDeployment } from "@/shared/web3/addresses";

// Calls faucet(), waits for the tx to be mined, then invalidates the on-chain
// query cache so balances refetch immediately instead of waiting for staleTime.
export function useFaucet() {
  const toast = useToast();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const claim = async (deployment: VaultDeployment) => {
    try {
      toast({ kind: "pending", title: "Claiming test tokens", desc: deployment.symbol });

      const hash = await writeContractAsync({
        address: deployment.token,
        abi: mockEquityTokenAbi,
        functionName: "faucet",
      });

      // wait for the transaction to actually be mined
      await publicClient?.waitForTransactionReceipt({ hash });

      // now that the chain state changed, force a refetch of balances/positions
      await queryClient.invalidateQueries({ queryKey: ["positions", "onchain"] });
      await queryClient.invalidateQueries({ queryKey: ["vaults", "onchain"] });

      toast({
        kind: "success",
        title: "Tokens claimed",
        desc: `10,000 ${deployment.symbol} minted`,
      });
    } catch (e) {
      const msg =
        e instanceof Error && e.message.includes("Cooldown")
          ? "Faucet on cooldown (8h)"
          : "Faucet failed";
      toast({ kind: "error", title: msg });
    }
  };

  return { claim };
}
