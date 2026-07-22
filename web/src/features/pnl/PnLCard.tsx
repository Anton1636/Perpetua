import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Card } from "@/shared/ui";
import { formatUsd, formatPct } from "@/shared/lib/format";
import { usePnL } from "./usePnL";
import { PositionChart } from "./PositionChart";

export function PnLCard() {
  const { pnl, history, currentValue, isLoading, symbol } = usePnL();

  if (isLoading) {
    return (
      <Card
        elevation={2}
        style={{
          padding: 20,
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--c-steel)",
        }}
      >
        <Loader2 size={15} className="spin" /> Loading performance…
      </Card>
    );
  }

  if (!pnl) return null;

  const positive = pnl.pnl >= 0n;
  const Icon = positive ? TrendingUp : TrendingDown;
  const color = positive ? "var(--c-lume)" : "var(--c-red)";

  return (
    <Card elevation={2} style={{ padding: 20, marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            className="label"
            style={{ fontSize: 11, color: "var(--c-faint)", letterSpacing: "0.07em" }}
          >
            PERFORMANCE · {symbol}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 28, fontWeight: 700, color }}>
              {positive ? "+" : "−"}
              {formatUsd(pnl.pnl < 0n ? -pnl.pnl : pnl.pnl)}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Icon size={14} /> {formatPct(Math.abs(pnl.pnlPct))}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "var(--c-steel)" }}>Cost basis</div>
          <div className="mono" style={{ fontSize: 15, color: "var(--c-cream)" }}>
            {formatUsd(pnl.costBasis)}
          </div>
          <div style={{ fontSize: 12, color: "var(--c-steel)", marginTop: 6 }}>Current value</div>
          <div className="mono" style={{ fontSize: 15, color: "var(--c-lume)" }}>
            {formatUsd(currentValue)}
          </div>
        </div>
      </div>

      <PositionChart history={history} currentValue={currentValue} />

      <div style={{ fontSize: 11, color: "var(--c-faint)", marginTop: 10 }}>
        Reconstructed from on-chain events via The Graph — identical on any device.
      </div>
    </Card>
  );
}
