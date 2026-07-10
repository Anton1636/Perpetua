import { create } from "zustand";
import type { ActivityEvent, ActivityKind, ActivityStatus } from "./types";
import type { DomainError } from "@/shared/lib/errors";

interface ActivityState {
  events: ActivityEvent[];
  begin: (kind: ActivityKind, vault: `0x${string}` | null, amount: bigint) => string;
  resolve: (
    id: string,
    status: Exclude<ActivityStatus, "pending">,
    patch?: { amount?: bigint; error?: DomainError },
  ) => void;
}

let seq = 0;
const nextId = () => `${Date.now()}-${++seq}`;

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],

  // append a pending record (the moment the user confirms in the modal)
  begin: (kind, vault, amount) => {
    const id = nextId();
    set((s) => ({
      events: [
        {
          id,
          kind,
          status: "pending" as const,
          vaultAddress: vault,
          amount,
          timestamp: Date.now(),
        },
        ...s.events,
      ],
    }));
    return id;
  },

  // flip pending -> confirmed/failed (the moment the "tx" settles)
  resolve: (id, status, patch) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              ...(patch?.amount !== undefined && { amount: patch.amount }),
              ...(patch?.error && { error: patch.error }),
            }
          : e,
      ),
    })),
}));
