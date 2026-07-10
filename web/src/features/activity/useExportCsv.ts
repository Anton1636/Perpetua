import Papa from "papaparse";
import type { ActivityEvent } from "@/entities/activity/types";
import { toNumber } from "@/shared/lib/format";

// Exports the ledger as CSV (the artifact an accountant would actually want).
export function useExportCsv() {
  return (events: ActivityEvent[], symbolOf: (a: `0x${string}` | null) => string) => {
    const rows = events.map((e) => ({
      timestamp: new Date(e.timestamp).toISOString(),
      action: e.kind,
      vault: symbolOf(e.vaultAddress),
      amount_usd: toNumber(e.amount).toFixed(2),
      status: e.status,
      error: e.error ?? "",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `perpetua-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
}
