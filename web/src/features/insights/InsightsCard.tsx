import { Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@/shared/ui";
import { useInsights } from "./useInsights";
import type { InsightSeverity } from "./insights-engine";

const SEVERITY = {
  opportunity: { icon: TrendingUp, color: "var(--c-lume)", bg: "var(--c-lumeDim)" },
  warning: { icon: AlertTriangle, color: "var(--c-amber)", bg: "var(--c-amberDim)" },
  info: { icon: Lightbulb, color: "var(--c-steel)", bg: "rgba(237,227,194,0.05)" },
} as const satisfies Record<InsightSeverity, unknown>;

export function InsightsCard() {
  const insights = useInsights();

  if (insights.length === 0) return null;

  return (
    <Card elevation={2} style={{ padding: 18, marginTop: 20 }}>
      <div
        className="label"
        style={{ fontSize: 11, color: "var(--c-faint)", letterSpacing: "0.07em", marginBottom: 12 }}
      >
        INSIGHTS
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insights.map((insight) => {
          const meta = SEVERITY[insight.severity];
          const Icon = meta.icon;
          return (
            <div key={insight.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--r-sm)",
                  flex: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: meta.bg,
                }}
              >
                <Icon size={16} color={meta.color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: meta.color }}>
                  {insight.title}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--c-steel)",
                    marginTop: 2,
                    lineHeight: 1.45,
                  }}
                >
                  {insight.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
