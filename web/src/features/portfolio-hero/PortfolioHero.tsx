import { Card, Pill } from "@/shared/ui";
import { usePortfolioTotals } from "@/entities/position/model";
import { useAvailable } from "@/entities/position/model";
import { useLiveAccrual } from "@/shared/lib/use-live-accrual";
import { formatUsd, formatPct } from "@/shared/lib/format";
import { ChronometerDial } from "./ChronometerDial";
import styles from "./PortfolioHero.module.css";

export function PortfolioHero() {
  const totals = usePortfolioTotals();
  const available = useAvailable();
  const liveAccrual = useLiveAccrual(totals.accrued, totals.staked, totals.blendedApy);

  return (
    <Card elevation={2} className={styles.hero}>
      <div>
        <div className={styles.eyebrow}>TOKENIZED EQUITIES · DIVIDENDS ON AUTOPILOT</div>

        <div className={styles.figures}>
          <div>
            <div className={styles.figLabel}>STAKED</div>
            <div className={styles.total}>{formatUsd(totals.staked)}</div>
          </div>
          <div className={styles.divider} />
          <div>
            <div className={styles.figLabel}>AVAILABLE</div>
            <div className={styles.available}>{formatUsd(available)}</div>
          </div>
        </div>

        <div className={styles.meta}>
          <Pill tone="lume">{formatPct(totals.blendedApy)} blended APY</Pill>
          <Pill tone="neutral">{totals.count} vaults</Pill>
        </div>
      </div>
      <div className={styles.dialWrap}>
        <ChronometerDial liveAccrual={liveAccrual} />
      </div>
    </Card>
  );
}
