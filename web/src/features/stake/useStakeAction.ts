import { useToast } from "@/shared/ui";
import { usePositionStore } from "@/entities/position/store";
import { formatUsd } from "@/shared/lib/format";
import type { Vault } from "@/entities/vault/types";

type Mode = "stake" | "unstake";

// Success toast fires ONLY if the store accepted the action; a rejected guard
// shows an error instead of lying to the user.
export function useStakeAction() {
  const toast = useToast();
  const stake = usePositionStore((s) => s.stake);
  const unstake = usePositionStore((s) => s.unstake);

  return (mode: Mode, vault: Vault, amountWei: bigint) => {
    toast({
      kind: "pending",
      title: "Transaction pending",
      desc: `${mode === "stake" ? "Staking" : "Unstaking"} ${formatUsd(amountWei)} · ${vault.symbol}`,
    });

    window.setTimeout(() => {
      const ok =
        mode === "stake" ? stake(vault.address, amountWei) : unstake(vault.address, amountWei);
      if (ok) {
        toast({
          kind: "success",
          title: "Confirmed",
          desc:
            mode === "stake"
              ? `Staked ${formatUsd(amountWei)} · earning yield`
              : `Unstaked ${formatUsd(amountWei)} to your wallet`,
        });
      } else {
        toast({
          kind: "error",
          title: "Transaction failed",
          desc: "Amount exceeds available balance",
        });
      }
    }, 1400);
  };
}
