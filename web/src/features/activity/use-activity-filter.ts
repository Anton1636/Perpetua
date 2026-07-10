import { useSearchParams } from "react-router-dom";
import type { ActivityFilter } from "@/entities/activity/selectors";

const FILTER_IDS: ActivityFilter[] = ["all", "stake", "unstake", "compound"];

// Filter state lives in the URL (?filter=stake): shareable, survives refresh.
export function useActivityFilter(): [ActivityFilter, (f: ActivityFilter) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get("filter");
  const filter: ActivityFilter = FILTER_IDS.includes(raw as ActivityFilter)
    ? (raw as ActivityFilter)
    : "all";
  const set = (f: ActivityFilter) => setParams(f === "all" ? {} : { filter: f }, { replace: true });
  return [filter, set];
}
