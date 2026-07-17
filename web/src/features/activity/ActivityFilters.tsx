import type { ActivityFilter } from "@/entities/activity/selectors";
import { useActivityFilter } from "./use-activity-filter";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "stake", label: "Stake" },
  { id: "unstake", label: "Unstake" },
  { id: "compound", label: "Harvest" },
  { id: "zap", label: "Zap" },
];

export function ActivityFilters() {
  const [filter, setFilter] = useActivityFilter();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          style={{
            padding: "7px 14px",
            borderRadius: "var(--r-sm)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: `1px solid ${filter === f.id ? "var(--c-lume)" : "var(--c-line)"}`,
            background: filter === f.id ? "var(--c-lumeDim)" : "var(--c-surface1)",
            color: filter === f.id ? "var(--c-lume)" : "var(--c-steel)",
            minHeight: 38,
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
