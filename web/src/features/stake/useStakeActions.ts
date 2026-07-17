import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useTxFlow } from "@/shared/web3/use-tx-flow";
import { dividendVaultAbi, mockEquityTokenAbi } from "@/shared/web3/generated";
import { useToast } from "@/shared/ui";
import type { VaultDeployment } from "@/shared/web3/addresses";
import { formatUsd } from "@/shared/lib/format";

export function useStakeActions() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const toast = useToast();
  const { run } = useTxFlow();

  const stake = async (deployment: VaultDeployment, amountWei: bigint) => {
    if (!address || !publicClient) return;

    try {
      const allowance = (await publicClient.readContract({
        address: deployment.token,
        abi: mockEquityTokenAbi,
        functionName: "allowance",
        args: [address, deployment.vault],
      })) as bigint;

      if (allowance < amountWei) {
        toast({ kind: "pending", title: "Approving", desc: deployment.symbol });
        const approveHash = await writeContractAsync({
          address: deployment.token,
          abi: mockEquityTokenAbi,
          functionName: "approve",
          args: [deployment.vault, amountWei],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
    } catch {
      toast({ kind: "error", title: "Approval failed or rejected" });
      return;
    }

    await run({
      kind: "stake",
      vaultAddress: deployment.vault,
      amount: amountWei,
      pendingTitle: `Staking ${formatUsd(amountWei)} · ${deployment.symbol}`,
      successTitle: "Confirmed",
      successDesc: `Staked ${formatUsd(amountWei)} · earning yield`,
      write: () =>
        writeContractAsync({
          address: deployment.vault,
          abi: dividendVaultAbi,
          functionName: "deposit",
          args: [amountWei, address],
        }),
    });
  };

  // Note: yield streams continuously (Day 13), so the real maxWithdraw can only
  // have RISEN since we last read it — withdraw(maxWei, ...) stays valid. A
  // pre-flight simulateContract (Day 21) would tighten this further.
  const unstake = async (deployment: VaultDeployment, amountWei: bigint) => {
    if (!address) return;
    await run({
      kind: "unstake",
      vaultAddress: deployment.vault,
      amount: amountWei,
      pendingTitle: `Unstaking ${formatUsd(amountWei)} · ${deployment.symbol}`,
      successTitle: "Confirmed",
      successDesc: `Unstaked ${formatUsd(amountWei)} to your wallet`,
      write: () =>
        writeContractAsync({
          address: deployment.vault,
          abi: dividendVaultAbi,
          functionName: "withdraw",
          args: [amountWei, address, address],
        }),
    });
  };

  return { stake, unstake };
}
