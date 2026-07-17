import { usePublicClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/ui";
import { useActivityStore } from "@/entities/activity/store";
import type { ActivityKind } from "@/entities/activity/types";
import { DomainError } from "@/shared/lib/errors";

interface RunParams {
  kind: ActivityKind;
  vaultAddress: `0x${string}` | null;
  amount: bigint;
  pendingTitle: string;
  successTitle: string;
  successDesc?: string;
  write: () => Promise<`0x${string}`>;
}

// Shared lifecycle for every on-chain write: log pending -> send -> wait for
// mining -> resolve + toast + refresh queries. Every stake/unstake/harvest/zap

export function useTxFlow() {
  const publicClient = usePublicClient();
  const toast = useToast();
  const queryClient = useQueryClient();
  const begin = useActivityStore((s) => s.begin);
  const resolve = useActivityStore((s) => s.resolve);
  const setHash = useActivityStore((s) => s.setHash);

  const run = async ({
    kind,
    vaultAddress,
    amount,
    pendingTitle,
    successTitle,
    successDesc,
    write,
  }: RunParams) => {
    if (!publicClient) {
      toast({ kind: "error", title: "Not connected", desc: "Connect your wallet and try again" });
      return;
    }

    const id = begin(kind, vaultAddress, amount);
    toast({ kind: "pending", title: pendingTitle });

    try {
      const hash = await write();
      setHash(id, hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        resolve(id, "confirmed");
        toast({ kind: "success", title: successTitle, desc: successDesc });
        await queryClient.invalidateQueries({ queryKey: ["positions", "onchain"] });
        await queryClient.invalidateQueries({ queryKey: ["vaults", "onchain"] });
      } else {
        resolve(id, "failed", { error: DomainError.Unknown });
        toast({ kind: "error", title: "Transaction reverted" });
      }
    } catch (e) {
      resolve(id, "failed", { error: DomainError.Unknown });
      toast({
        kind: "error",
        title: "Transaction rejected",
        desc: e instanceof Error ? e.message.slice(0, 80) : undefined,
      });
    }
  };

  return { run };
}
