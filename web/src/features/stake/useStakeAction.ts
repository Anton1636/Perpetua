import { useToast } from "@/shared/ui";
import { usePositionStore } from "@/entities/position/store";
import { formatUsd } from "@/shared/lib/format";
import type { Vault } from "@/entities/vault/types";

type Mode = "stake" | "unstake";

// Simulates the tx lifecycle (pending -> success) and applies the store action.

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

    // simulate confirmation delay
    window.setTimeout(() => {
      if (mode === "stake") stake(vault.address, amountWei, vault.pricePerShare);
      else unstake(vault.address, amountWei);

      toast({
        kind: "success",
        title: "Confirmed",
        desc:
          mode === "stake"
            ? `Staked ${formatUsd(amountWei)} · earning yield`
            : `Unstaked ${formatUsd(amountWei)} to your wallet`,
      });
    }, 1400);
  };
}
