import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useTxFlow } from "@/shared/web3/use-tx-flow";
import { mockEquityTokenAbi, zapRouterAbi } from "@/shared/web3/generated";
import { CONTRACTS, vaultByAddress } from "@/shared/web3/addresses";
import { useToast } from "@/shared/ui";
import { formatUsd } from "@/shared/lib/format";

interface ZapItem {
  symbol: string;
  vaultAddress: `0x${string}`;
  amountWei: bigint;
}

// Stakes into multiple vaults in one batched flow: approve each token that
// needs it, then a single zapDeposit call via ZapRouter.
export function useZapOnChain() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { run } = useTxFlow();
  const toast = useToast();
  const [isZapping, setIsZapping] = useState(false);

  const zap = async (items: ZapItem[]) => {
    if (!address || !publicClient || items.length === 0) return;
    setIsZapping(true);

    try {
      for (const item of items) {
        const deployment = vaultByAddress(item.vaultAddress);
        if (!deployment) continue;
        const allowance = (await publicClient.readContract({
          address: deployment.token,
          abi: mockEquityTokenAbi,
          functionName: "allowance",
          args: [address, CONTRACTS.zapRouter],
        })) as bigint;
        if (allowance < item.amountWei) {
          const hash = await writeContractAsync({
            address: deployment.token,
            abi: mockEquityTokenAbi,
            functionName: "approve",
            args: [CONTRACTS.zapRouter, item.amountWei],
          });
          await publicClient.waitForTransactionReceipt({ hash });
        }
      }
    } catch {
      toast({ kind: "error", title: "Approval failed or rejected" });
      setIsZapping(false);
      return;
    }

    const totalWei = items.reduce((s, i) => s + i.amountWei, 0n);
    await run({
      kind: "zap",
      vaultAddress: null,
      amount: totalWei,
      pendingTitle: `Zapping into ${items.length} vaults`,
      successTitle: "Zap complete",
      successDesc: `${formatUsd(totalWei)} staked across ${items.length} vaults`,
      write: () =>
        writeContractAsync({
          address: CONTRACTS.zapRouter,
          abi: zapRouterAbi,
          functionName: "zapDeposit",
          args: [items.map((i) => ({ vault: i.vaultAddress, amount: i.amountWei }))],
        }),
    });
    setIsZapping(false);
  };

  return { zap, isZapping };
}
