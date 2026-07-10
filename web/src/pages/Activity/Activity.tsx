import { Download } from "lucide-react";
import { Button } from "@/shared/ui";
import { useActivityStore } from "@/entities/activity/store";
import { filterEvents, pendingCount } from "@/entities/activity/selectors";
import { useVaults } from "@/entities/vault/model";
import { ActivityTable } from "@/features/activity/ActivityTable";
import { ActivityFilters } from "@/features/activity/ActivityFilters";
import { useActivityFilter } from "@/features/activity/use-activity-filter";
import { useExportCsv } from "@/features/activity/useExportCsv";

export function Activity() {
  const events = useActivityStore((s) => s.events);
  const [filter] = useActivityFilter();
  const { data: vaults } = useVaults();
  const exportCsv = useExportCsv();

  const filtered = filterEvents(events, filter);
  const pending = pendingCount(events);
  const symbolOf = (addr: `0x${string}` | null) =>
    addr ? (vaults?.find((v) => v.address === addr)?.symbol ?? "—") : "All vaults";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          margin: "10px 0 18px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontWeight: 700,
              fontSize: "clamp(26px,4vw,34px)",
              letterSpacing: "-0.01em",
              color: "var(--c-cream)",
            }}
          >
            Activity
          </h1>
          <div style={{ color: "var(--c-steel)", fontSize: 14, marginTop: 5 }}>
            {events.length} records
            {pending > 0 && <span style={{ color: "var(--c-amber)" }}> · {pending} pending</span>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => exportCsv(filtered, symbolOf)}
          disabled={filtered.length === 0}
        >
          <Download size={15} /> Export CSV
        </Button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <ActivityFilters />
      </div>

      <ActivityTable events={filtered} />
    </div>
  );
}
