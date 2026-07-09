import { Card, Skeleton, Button } from "@/shared/ui";
import { usePositions } from "@/entities/position/model";
import { useVaults } from "@/entities/vault/model";
import { PortfolioHero } from "@/features/portfolio-hero/PortfolioHero";
import styles from "./Portfolio.module.css";

export function Portfolio() {
  const positions = usePositions();
  const vaults = useVaults();

  // error state
  if (positions.isError || vaults.isError) {
    return (
      <div>
        <h1 className={styles.title}>Portfolio</h1>
        <Card elevation={2} className={styles.error}>
          <p>Couldn’t load your portfolio.</p>
          <Button
            variant="ghost"
            size="sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              positions.refetch();
              vaults.refetch();
            }}
          >
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  // loading state (skeleton hero)
  if (positions.isLoading || vaults.isLoading) {
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

  // empty state
  if ((positions.data?.length ?? 0) === 0) {
    return (
      <div>
        <h1 className={styles.title}>Portfolio</h1>
        <Card elevation={2} style={{ padding: 48, textAlign: "center" }}>
          <p style={{ color: "var(--c-steel)" }}>No positions yet.</p>
          <Button style={{ marginTop: 16 }}>Browse vaults</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Portfolio</h1>
      <PortfolioHero />
    </div>
  );
}
