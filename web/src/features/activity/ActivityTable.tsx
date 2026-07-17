import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  Inbox,
  Zap as ZapIcon,
  ExternalLink,
} from "lucide-react";
import { Card, Pill } from "@/shared/ui";
import type { ActivityEvent } from "@/entities/activity/types";
import { useVaults } from "@/entities/vault/model";
import { formatUsd } from "@/shared/lib/format";
import { ERROR_COPY } from "@/shared/lib/errors";
import styles from "./ActivityTable.module.css";

const KIND_META = {
  stake: { icon: ArrowDownToLine, label: "Stake", sign: "+" },
  unstake: { icon: ArrowUpFromLine, label: "Unstake", sign: "−" },
  compound: { icon: RefreshCw, label: "Harvest", sign: "+" },
  accrue: { icon: RefreshCw, label: "Accrue", sign: "+" },
  zap: { icon: ZapIcon, label: "Zap", sign: "+" },
} as const;

function StatusPill({ e }: { e: ActivityEvent }) {
  if (e.status === "confirmed")
    return (
      <Pill tone="lume">
        <CheckCircle2 size={13} /> Confirmed
      </Pill>
    );
  if (e.status === "pending")
    return (
      <Pill tone="amber">
        <Loader2 size={13} className="spin" /> Pending
      </Pill>
    );
  return (
    <Pill tone="red">
      <XCircle size={13} /> Failed
    </Pill>
  );
}

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export function ActivityTable({ events }: { events: ActivityEvent[] }) {
  const { data: vaults } = useVaults();
  const symbolOf = (addr: `0x${string}` | null) =>
    addr ? (vaults?.find((v) => v.address === addr)?.symbol ?? "—") : "All vaults";

  if (events.length === 0) {
    return (
      <Card elevation={2} className={styles.empty}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(237,227,194,0.04)",
            border: "1px solid var(--c-line)",
            marginBottom: 14,
          }}
        >
          <Inbox size={26} color="var(--c-lume)" />
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontWeight: 600, fontSize: 20 }}>
          No activity yet
        </div>
        <p style={{ color: "var(--c-steel)", marginTop: 6, fontSize: 14 }}>
          Stake, unstake or compound — every action lands in this ledger.
        </p>
      </Card>
    );
  }

  return (
    <Card elevation={2} className={styles.tbl}>
      <div className={`${styles.row} ${styles.head}`}>
        <span className={styles.label}>Action</span>
        <span className={styles.label}>Amount</span>
        <span className={styles.label}>Status</span>
        <span className={styles.label}>Time</span>
      </div>
      {events.map((e) => {
        const meta = KIND_META[e.kind];
        const Icon = meta.icon;
        return (
          <div key={e.id} className={styles.row}>
            <div className={styles.cell}>
              <div className={styles.tname}>
                <div className={styles.tic}>
                  <Icon size={17} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{meta.label}</div>
                  <div className="mono" style={{ color: "var(--c-steel)", fontSize: 12.5 }}>
                    {symbolOf(e.vaultAddress)}
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
                  color:
                    e.status === "failed"
                      ? "var(--c-faint)"
                      : meta.sign === "+"
                        ? "var(--c-lume)"
                        : "var(--c-steel)",
                }}
              >
                {meta.sign}
                {formatUsd(e.amount)}
              </span>
            </div>
            <div className={styles.cell}>
              <span className={styles.clabel}>Status</span>
              <div>
                <StatusPill e={e} />
                {e.error && (
                  <div style={{ fontSize: 11, color: "var(--c-red)", marginTop: 4 }}>
                    {ERROR_COPY[e.error].title}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.cell}>
              <span className={styles.clabel}>Time</span>
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}
              >
                <span
                  style={{
                    color: "var(--c-steel)",
                    fontSize: 13,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock size={13} /> {timeAgo(e.timestamp)}
                </span>
                {e.hash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${e.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "#9FD9FF",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    View <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
