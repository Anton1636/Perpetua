import { useState, useCallback, useRef } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { BaseError, ContractFunctionRevertedError, formatEther } from "viem";
import { dividendVaultAbi } from "@/shared/web3/generated";

export interface SimParams {
  key: string;
  mode: "stake" | "unstake";
  vault: `0x${string}`;
  amountWei: bigint;
}

export interface SimResult {
  /** Input this result belongs to — callers must ignore non-matching keys. */
  key: string;
  ok: boolean;
  error?: string;
  /** Revert is only a missing allowance — the flow is fine, approve comes first. */
  needsApproval?: boolean;
  gasEstimate?: bigint;
  gasCostEth?: string;
}

export function useSimulate() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [result, setResult] = useState<SimResult | null>(null);

  // Monotonic id: a slow early response must never overwrite a newer one.
  const seq = useRef(0);

  const simulate = useCallback(
    async ({ key, mode, vault, amountWei }: SimParams) => {
      const id = ++seq.current;
      const isCurrent = () => id === seq.current;

      if (!publicClient || !address) {
        setResult({ key, ok: false, error: "Connect a wallet to simulate" });
        return;
      }

      try {
        const functionName = mode === "stake" ? "deposit" : "withdraw";
        const args =
          mode === "stake"
            ? ([amountWei, address] as const)
            : ([amountWei, address, address] as const);

        // estimateContractGas runs the same eth_call as simulateContract and
        // throws on revert — one round-trip instead of two.
        const gas = await publicClient.estimateContractGas({
          address: vault,
          abi: dividendVaultAbi,
          functionName,
          args,
          account: address,
        });
        if (!isCurrent()) return;

        let feePerGas: bigint;
        try {
          const fees = await publicClient.estimateFeesPerGas();
          feePerGas = fees.maxFeePerGas ?? (await publicClient.getGasPrice());
        } catch {
          feePerGas = await publicClient.getGasPrice(); // chain without fee history
        }
        if (!isCurrent()) return;

        setResult({
          key,
          ok: true,
          gasEstimate: gas,
          gasCostEth: trimEth(formatEther(gas * feePerGas)),
        });
      } catch (e) {
        if (!isCurrent()) return;
        setResult({ key, ...describeRevert(e) });
      }
    },
    [publicClient, address],
  );

  return { simulate, result };
}

const REVERT_COPY: Record<string, string> = {
  EnforcedPause: "Vault is paused",
  ERC20InsufficientBalance: "Amount exceeds your balance",
  ERC4626ExceededMaxDeposit: "Amount exceeds the vault deposit cap",
  ERC4626ExceededMaxWithdraw: "Amount exceeds your withdrawable balance",
  ERC4626ExceededMaxRedeem: "Amount exceeds your redeemable shares",
};

// OZ 5.x reverts with custom errors, so viem's decoded errorName is the only
// reliable signal — string matching on the message does not work.
function describeRevert(e: unknown): Omit<SimResult, "key"> {
  if (e instanceof BaseError) {
    const revert = e.walk((err) => err instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      if (name === "ERC20InsufficientAllowance") {
        return { ok: false, needsApproval: true, error: "Approval required before staking" };
      }
      if (name && REVERT_COPY[name]) return { ok: false, error: REVERT_COPY[name] };
      if (name) return { ok: false, error: name };
      if (revert.reason) return { ok: false, error: revert.reason.slice(0, 80) };
    }
    return { ok: false, error: e.shortMessage.slice(0, 100) };
  }
  return { ok: false, error: "Simulation failed" };
}

function trimEth(v: string): string {
  const n = Number(v);
  if (n === 0) return "0";
  if (n < 0.000001) return "<0.000001";
  return n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}
