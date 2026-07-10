import { useSearchParams } from "react-router-dom";
import type { ActivityFilter } from "@/entities/activity/selectors";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "stake", label: "Stake" },
  { id: "unstake", label: "Unstake" },
  { id: "compound", label: "Compound" },
];

// Filter state lives in the URL (?filter=stake): shareable, survives refresh.
export function useActivityFilter(): [ActivityFilter, (f: ActivityFilter) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get("filter");
  const filter: ActivityFilter = FILTERS.some((f) => f.id === raw)
    ? (raw as ActivityFilter)
    : "all";
  const set = (f: ActivityFilter) => setParams(f === "all" ? {} : { filter: f }, { replace: true });
  return [filter, set];
}

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
