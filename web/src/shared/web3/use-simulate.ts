import { useState, useCallback } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { dividendVaultAbi } from "@/shared/web3/generated";

export interface SimResult {
  ok: boolean;
  error?: string;
  gasEstimate?: bigint;
  gasCostEth?: string;
}

// Simulates a stake/unstake on a fork before the user signs, catching reverts
// and estimating gas.
export function useSimulate() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [result, setResult] = useState<SimResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulate = useCallback(
    async (params: { mode: "stake" | "unstake"; vault: `0x${string}`; amountWei: bigint }) => {
      if (!publicClient || !address) return;
      setIsSimulating(true);
      setResult(null);

      try {
        const { mode, vault, amountWei } = params;
        const functionName = mode === "stake" ? "deposit" : "withdraw";
        const args =
          mode === "stake"
            ? ([amountWei, address] as const)
            : ([amountWei, address, address] as const);

        // simulateContract reverts (throws) if the tx would fail on-chain
        await publicClient.simulateContract({
          address: vault,
          abi: dividendVaultAbi,
          functionName,
          args,
          account: address,
        });

        // estimate gas for the same call
        const gas = await publicClient.estimateContractGas({
          address: vault,
          abi: dividendVaultAbi,
          functionName,
          args,
          account: address,
        });
        const gasPrice = await publicClient.getGasPrice();
        const costWei = gas * gasPrice;
        const costEth = Number(costWei) / 1e18;

        setResult({
          ok: true,
          gasEstimate: gas,
          gasCostEth: costEth.toFixed(6),
        });
      } catch (e) {
        setResult({
          ok: false,
          error: e instanceof Error ? shortenRevert(e.message) : "Simulation failed",
        });
      } finally {
        setIsSimulating(false);
      }
    },
    [publicClient, address],
  );

  const reset = useCallback(() => setResult(null), []);

  return { simulate, result, isSimulating, reset };
}

// Extract a human-readable reason from a verbose viem revert error.
function shortenRevert(msg: string): string {
  if (msg.includes("exceeds")) return "Amount exceeds your balance";
  if (msg.includes("paused") || msg.includes("Paused")) return "Vault is paused";
  if (msg.includes("insufficient")) return "Insufficient balance";
  const match = msg.match(/reason:\s*(.+?)(\n|$)/);
  return match?.[1]?.slice(0, 80) ?? "Transaction would revert";
}
