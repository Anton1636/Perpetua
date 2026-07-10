import { useToast } from "@/shared/ui";
import { usePositionStore } from "@/entities/position/store";
import { useActivityStore } from "@/entities/activity/store";
import { DomainError, ERROR_COPY } from "@/shared/lib/errors";
import { formatUsd } from "@/shared/lib/format";
import type { Vault } from "@/entities/vault/types";

type Mode = "stake" | "unstake";

// Actions now flow through the ledger: begin(pending) -> apply -> resolve.
// Activity is just a render of this log; on Day 16 the same records originate
// from contract events.
export function useStakeAction() {
  const toast = useToast();
  const stake = usePositionStore((s) => s.stake);
  const unstake = usePositionStore((s) => s.unstake);
  const begin = useActivityStore((s) => s.begin);
  const resolve = useActivityStore((s) => s.resolve);

  return (mode: Mode, vault: Vault, amountWei: bigint) => {
    const id = begin(mode, vault.address, amountWei);
    toast({
      kind: "pending",
      title: "Transaction pending",
      desc: `${mode === "stake" ? "Staking" : "Unstaking"} ${formatUsd(amountWei)} · ${vault.symbol}`,
    });

    window.setTimeout(() => {
      const ok =
        mode === "stake" ? stake(vault.address, amountWei) : unstake(vault.address, amountWei);
      if (ok) {
        resolve(id, "confirmed");
        toast({
          kind: "success",
          title: "Confirmed",
          desc:
            mode === "stake"
              ? `Staked ${formatUsd(amountWei)} · earning yield`
              : `Unstaked ${formatUsd(amountWei)} to your wallet`,
        });
      } else {
        const code =
          mode === "stake" ? DomainError.InsufficientBalance : DomainError.ExceedsPosition;
        resolve(id, "failed", { error: code });
        toast({ kind: "error", title: ERROR_COPY[code].title, desc: ERROR_COPY[code].desc });
      }
    }, 1400);
  };
}
