import type { ActivityEvent, ActivityKind } from "./types";

// Derived data = pure functions over the primary log (see ARCHITECTURE rule:
// never store what you can derive).
export type ActivityFilter = "all" | ActivityKind;

export function filterEvents(events: ActivityEvent[], filter: ActivityFilter): ActivityEvent[] {
  return filter === "all" ? events : events.filter((e) => e.kind === filter);
}

export function pendingCount(events: ActivityEvent[]): number {
  return events.filter((e) => e.status === "pending").length;
}
