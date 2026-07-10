import { ShieldCheck } from "lucide-react";
import type { PreviewResult } from "@/entities/position/preview";
import { formatUsd } from "@/shared/lib/format";
import styles from "./TxPreview.module.css";

// Shows the outcome of an action BEFORE the user commits — balance changes, fee,
// and a security check line. On Day 21 the same panel is fed by simulateContract.
export function TxPreview({ preview }: { preview: PreviewResult }) {
  if (!preview.ok) return null;
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.k}>Available after</span>
        <span className={styles.v}>{formatUsd(preview.availableAfter)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.k}>Staked after</span>
        <span className={`${styles.v} ${styles.delta}`}>{formatUsd(preview.stakedAfter)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.k}>Protocol fee</span>
        <span className={styles.v}>{preview.fee === 0n ? "None" : formatUsd(preview.fee)}</span>
      </div>
      <div className={styles.check}>
        <ShieldCheck size={14} color="var(--c-lume)" /> Simulated locally · no funds move until you
        confirm
      </div>
    </div>
  );
}
