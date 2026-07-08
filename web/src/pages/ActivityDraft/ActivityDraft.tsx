import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { Card, Pill, Button } from "@/shared/ui";
import { useToast } from "@/shared/ui";
import styles from "./ActivityDraft.module.css";

const TYPES = {
  stake: { icon: ArrowDownToLine, label: "Stake" },
  unstake: { icon: ArrowUpFromLine, label: "Unstake" },
  compound: { icon: RefreshCw, label: "Compound" },
} as const;

const ROWS = [
  { id: 1, type: "compound", asset: "4 vaults", amount: "+$128.44", time: "2 min ago" },
  { id: 2, type: "stake", asset: "Ox", amount: "+$5,000.00", time: "1 hr ago" },
  { id: 3, type: "unstake", asset: "KOx", amount: "−$1,200.00", time: "3 hrs ago" },
  { id: 4, type: "stake", asset: "SPYx", amount: "+$3,000.00", time: "Yesterday" },
  { id: 5, type: "compound", asset: "4 vaults", amount: "+$96.10", time: "2 days ago" },
] as const;

export function ActivityDraft() {
  const toast = useToast();
  return (
    <div>
      <div className={styles.head}>
        <h1 className={styles.title}>Activity</h1>
        <p className={styles.sub}>Draft — proving the design holds on dense data.</p>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            toast({ kind: "success", title: "Toast works", desc: "Chronograph notification" })
          }
        >
          Test toast
        </Button>
      </div>

      <Card elevation={2} className={styles.tbl}>
        <div className={`${styles.row} ${styles.head}`}>
          <span className={styles.label}>Action</span>
          <span className={styles.label}>Amount</span>
          <span className={styles.label}>Status</span>
          <span className={styles.label}>Time</span>
        </div>
        {ROWS.map((r) => {
          const T = TYPES[r.type];
          const Icon = T.icon;
          return (
            <div key={r.id} className={styles.row}>
              <div className={styles.cell}>
                <div className={styles.tname}>
                  <div className={styles.tic}>
                    <Icon size={17} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{T.label}</div>
                    <div className="mono" style={{ color: "var(--c-steel)", fontSize: 12.5 }}>
                      {r.asset}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.cell}>
                <span className={styles.clabel}>Amount</span>
                <span
                  className="mono"
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: r.amount.startsWith("+") ? "var(--c-lume)" : "var(--c-steel)",
                  }}
                >
                  {r.amount}
                </span>
              </div>
              <div className={styles.cell}>
                <span className={styles.clabel}>Status</span>
                <Pill tone="lume">
                  <CheckCircle2 size={13} /> Success
                </Pill>
              </div>
              <div className={styles.cell}>
                <span className={styles.clabel}>Time</span>
                <span
                  style={{
                    color: "var(--c-steel)",
                    fontSize: 13,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock size={13} /> {r.time}
                </span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
