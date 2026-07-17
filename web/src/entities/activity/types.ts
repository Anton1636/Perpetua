import type { DomainError } from "@/shared/lib/errors";

// The ledger. Financial systems are a journal of operations first; balances are
// a derived snapshot. Every store action appends here.
export type ActivityKind = "stake" | "unstake" | "compound" | "accrue" | "zap";
export type ActivityStatus = "pending" | "confirmed" | "failed";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  status: ActivityStatus;
  vaultAddress: `0x${string}` | null; // null => portfolio-wide (compound)
  amount: bigint; // wei
  timestamp: number; // ms epoch
  error?: DomainError; // set when status === "failed"
  hash?: `0x${string}`; // on-chain tx hash, attached once known
}
