import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { HistoryPoint } from "./pnl-math";
import { formatUsdNumber, toNumber } from "@/shared/lib/format";

interface Props {
  history: HistoryPoint[];
  currentValue: bigint;
}

// Shows invested capital over time (reconstructed from indexed events) against
// the position's current value. A true value-over-time curve would need
// historical share-price snapshots — deliberately not faked here.
export function PositionChart({ history, currentValue }: Props) {
  if (history.length === 0) return null;

  const data = history.map((p) => ({
    time: new Date(p.timestamp * 1000).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    invested: p.invested,
  }));
  const current = toNumber(currentValue);

  return (
    <div style={{ height: 200, marginTop: 14 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="time"
            stroke="var(--c-faint)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--c-faint)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(v) => formatUsdNumber(Number(v ?? 0), 0)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--c-surface3)",
              border: "1px solid var(--c-line2)",
              borderRadius: 10,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--c-steel)" }}
            formatter={(value) =>
              [formatUsdNumber(Number(value ?? 0)), "Invested"] as [string, string]
            }
          />
          <ReferenceLine
            y={current}
            stroke="var(--c-lume)"
            strokeDasharray="4 4"
            label={{
              value: "Current value",
              fill: "var(--c-lume)",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
          <Line
            type="stepAfter"
            dataKey="invested"
            stroke="var(--c-cream)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--c-cream)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
