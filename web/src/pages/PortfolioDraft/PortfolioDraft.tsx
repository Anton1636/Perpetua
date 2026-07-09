import { Card } from "@/shared/ui";
import { useVaults, vaultApy } from "@/entities/vault/model";
import { usePositions, usePortfolioTotals } from "@/entities/position/model";
import { formatUsd, formatUsdPrecise, formatPct } from "@/shared/lib/format";

// Draft: proves the domain layer (chain-shaped mocks -> hooks -> UI) works end to end, with real loading states.
export function PortfolioDraft() {
  const vaults = useVaults();
  const positions = usePositions();
  const totals = usePortfolioTotals();

  return (
    <div style={{ padding: "10px 0" }}>
      <h1 style={{ fontSize: "var(--t-head)", color: "var(--c-cream)" }}>Portfolio</h1>

      <Card elevation={2} style={{ padding: 20, marginTop: 16, maxWidth: 420 }}>
        {positions.isLoading || vaults.isLoading ? (
          <div style={{ color: "var(--c-steel)" }}>Loading domain…</div>
        ) : (
          <>
            <div
              className="label"
              style={{ color: "var(--c-faint)", fontSize: 11, letterSpacing: "0.07em" }}
            >
              TOTAL STAKED
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 34, color: "var(--c-cream)" }}>
              {formatUsd(totals.staked)}
            </div>
            <div style={{ color: "var(--c-lume)", marginTop: 4 }}>
              {formatPct(totals.blendedApy)} blended APY · {totals.count} vaults
            </div>
            <div className="mono" style={{ color: "var(--c-lume)", marginTop: 8, fontSize: 13 }}>
              accrued {formatUsdPrecise(totals.accrued)}
            </div>
          </>
        )}
      </Card>

      <div style={{ marginTop: 20, display: "grid", gap: 10, maxWidth: 420 }}>
        {vaults.data?.map((v) => (
          <Card
            key={v.address}
            elevation={1}
            style={{ padding: 14, display: "flex", justifyContent: "space-between" }}
          >
            <span className="mono" style={{ color: "var(--c-cream)" }}>
              {v.symbol}
            </span>
            <span className="mono" style={{ color: "var(--c-lume)" }}>
              {formatPct(vaultApy(v))}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
