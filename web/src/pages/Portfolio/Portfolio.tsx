import { Card, Skeleton, Button } from "@/shared/ui";
import { useVaults } from "@/entities/vault/model";
import { usePositions } from "@/entities/position/model";
import { PortfolioHero } from "@/features/portfolio-hero/PortfolioHero";
import { VaultsGrid } from "@/features/vaults-grid/VaultsGrid";
import styles from "./Portfolio.module.css";
import { useAccount } from "wagmi";
import { VAULTS } from "@/shared/web3/addresses";
import { useTokenBalance } from "@/features/wallet/useTokenBalance";
import { formatUsd } from "@/shared/lib/format";

function OnChainBalances() {
  const { isConnected } = useAccount();
  if (!isConnected) return null;
  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        border: "1px solid var(--c-line)",
        borderRadius: "var(--r-md)",
        background: "var(--c-surface1)",
      }}
    >
      <div
        className="label"
        style={{ fontSize: 11, color: "var(--c-faint)", letterSpacing: "0.07em", marginBottom: 10 }}
      >
        ON-CHAIN WALLET BALANCES (LIVE FROM SEPOLIA)
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {VAULTS.map((v) => (
          <BalanceRow key={v.symbol} deployment={v} />
        ))}
      </div>
    </div>
  );
}

function BalanceRow({ deployment }: { deployment: (typeof VAULTS)[number] }) {
  const { balance, isLoading } = useTokenBalance(deployment);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span className="mono" style={{ color: "var(--c-cream)" }}>
        {deployment.symbol}
      </span>
      <span className="mono" style={{ color: balance > 0n ? "var(--c-lume)" : "var(--c-faint)" }}>
        {isLoading ? "…" : formatUsd(balance)}
      </span>
    </div>
  );
}

export function Portfolio() {
  const vaults = useVaults();
  const positions = usePositions();

  if (vaults.isError) {
    return (
      <div>
        <h1 className={styles.title}>Portfolio</h1>
        <Card elevation={2} className={styles.error}>
          <p>Couldn’t load your portfolio.</p>
          <Button
            variant="ghost"
            size="sm"
            style={{ marginTop: 12 }}
            onClick={() => vaults.refetch()}
          >
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  if (vaults.isLoading) {
    return (
      <div>
        <h1 className={styles.title}>Portfolio</h1>
        <Card elevation={2} style={{ padding: 32 }}>
          <Skeleton width={220} height={12} />
          <Skeleton width={280} height={52} radius={8} />
          <div style={{ display: "flex", gap: 8 }}>
            <Skeleton width={140} height={28} radius={999} />
            <Skeleton width={90} height={28} radius={999} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Portfolio</h1>
      {positions.length > 0 ? (
        <PortfolioHero />
      ) : (
        <Card elevation={2} style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: "var(--c-steel)" }}>No positions yet. Stake a vault to begin.</p>
        </Card>
      )}
      <VaultsGrid />
      <OnChainBalances />
    </div>
  );
}
