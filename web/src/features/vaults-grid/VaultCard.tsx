import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Card, Button } from "@/shared/ui";
import type { Vault } from "@/entities/vault/types";
import { vaultApy } from "@/entities/vault/model";
import { usePositionStore } from "@/entities/position/store";
import { formatUsd, formatPct } from "@/shared/lib/format";
import { RISK_META } from "@/shared/lib/risk";
import styles from "./VaultCard.module.css";

interface Props {
  vault: Vault;
  onStake: (v: Vault) => void;
  onUnstake: (v: Vault) => void;
}

export function VaultCard({ vault, onStake, onUnstake }: Props) {
  const position = usePositionStore((s) =>
    s.positions.find((p) => p.vaultAddress === vault.address),
  );
  const risk = RISK_META[vault.risk];
  const staked = position?.shares ?? 0n;

  return (
    <Card elevation={2} className={styles.card}>
      <div className={styles.top}>
        <div className={styles.icon}>{vault.symbol.replace(/x$/, "").slice(0, 2)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mono" style={{ fontWeight: 600, fontSize: 15 }}>
            {vault.symbol}
          </div>
          <div style={{ fontSize: 12, color: "var(--c-steel)" }}>{vault.name}</div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 999,
            background: "var(--c-lumeDim)",
            color: "var(--c-lume)",
          }}
        >
          {vault.tag}
        </span>
      </div>

      <div className={styles.apyRow}>
        <div>
          <div
            className="label"
            style={{ fontSize: 11, color: "var(--c-faint)", letterSpacing: "0.07em" }}
          >
            APY
          </div>
          <div className={styles.apy}>{formatPct(vaultApy(vault))}</div>
        </div>
        <span className={styles.risk} style={{ color: risk.color }}>
          <span className={styles.bars}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={styles.bar}
                style={{ background: i < risk.segments ? risk.color : "rgba(237,227,194,0.12)" }}
              />
            ))}
          </span>
          {risk.label}
        </span>
      </div>

      {staked > 0n ? (
        <div className={styles.position}>
          <div className={styles.posRow}>
            <span style={{ color: "var(--c-steel)" }}>Your stake</span>
            <span className="mono" style={{ fontWeight: 600 }}>
              {formatUsd(staked)}
            </span>
          </div>
          <div className={styles.posRow} style={{ marginTop: 5 }}>
            <span style={{ color: "var(--c-steel)" }}>Earned</span>
            <span className="mono" style={{ fontWeight: 600, color: "var(--c-lume)" }}>
              {formatUsd(position!.accrued)}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--c-faint)" }}>TVL {formatUsd(vault.tvl)}</div>
      )}

      <div className={styles.actions}>
        <Button style={{ flex: 1 }} onClick={() => onStake(vault)}>
          <ArrowDownToLine size={15} /> Stake
        </Button>
        {staked > 0n && (
          <Button variant="ghost" onClick={() => onUnstake(vault)} aria-label="Unstake">
            <ArrowUpFromLine size={15} />
          </Button>
        )}
      </div>
    </Card>
  );
}
