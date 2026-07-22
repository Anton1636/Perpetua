import { Card, Skeleton, Button } from "@/shared/ui";
import { useVaults } from "@/entities/vault/model";
import { usePositions } from "@/entities/position/model";
import { PortfolioHero } from "@/features/portfolio-hero/PortfolioHero";
import { VaultsGrid } from "@/features/vaults-grid/VaultsGrid";
import styles from "./Portfolio.module.css";
import { PnLCard } from "@/features/pnl/PnLCard";

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
      <PnLCard />
      <VaultsGrid />
    </div>
  );
}
