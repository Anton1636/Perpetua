import { useMemo, useState } from "react";
import { Modal, Button } from "@/shared/ui";
import type { Vault } from "@/entities/vault/types";
import { usePositionStore } from "@/entities/position/store";
import { amountSchema } from "./schema";
import { useStakeAction } from "./useStakeAction";
import { formatUsd, formatUsdNumber, formatPct, toWei, toNumber } from "@/shared/lib/format";
import { vaultApy } from "@/entities/vault/model";
import styles from "./StakeModal.module.css";
import { previewStake, previewUnstake } from "@/entities/position/preview";
import { TxPreview } from "@/features/security/TxPreview";

interface Props {
  vault: Vault | null;
  mode: "stake" | "unstake";
  onClose: () => void;
}

export function StakeModal({ vault, mode, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const runAction = useStakeAction();
  const positions = usePositionStore((s) => s.positions);
  const available = usePositionStore((s) => s.available);

  const staked = vault
    ? (positions.find((p) => p.vaultAddress === vault.address)?.assets ?? 0n)
    : 0n;
  const maxWei = vault ? (mode === "stake" ? available : staked) : 0n;

  const validation = useMemo(() => {
    if (!vault) return { ok: false, error: "" };
    const result = amountSchema(maxWei).safeParse(amount);
    return result.success
      ? { ok: true, error: "" }
      : { ok: false, error: result.error.issues[0]?.message ?? "" };
  }, [amount, maxWei, vault]);

  const preview = useMemo(() => {
    if (!vault || !amount || !validation.ok) return null;
    const pos = positions.find((p) => p.vaultAddress === vault.address);
    const amt = toWei(amount);
    return mode === "stake"
      ? previewStake(amt, available, pos)
      : previewUnstake(amt, available, pos);
  }, [vault, amount, validation.ok, mode, available, positions]);

  if (!vault) return null;

  const submit = () => {
    if (!validation.ok) return;
    runAction(mode, vault, toWei(amount));
    onClose();
  };

  const setPct = (pct: number) => setAmount(String(Math.round(toNumber(maxWei) * pct)));

  return (
    <Modal
      open={!!vault}
      onOpenChange={(o) => !o && onClose()}
      title={`${mode === "stake" ? "Stake" : "Unstake"} ${vault.symbol}`}
    >
      <div className={styles.head}>
        <div className={styles.icon}>{vault.symbol.replace(/x$/, "").slice(0, 2)}</div>
        <div>
          <div className="mono" style={{ fontWeight: 600 }}>
            {vault.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--c-steel)" }}>
            {formatPct(vaultApy(vault))} APY
          </div>
        </div>
      </div>

      <div className={styles.balRow}>
        <span
          className="label"
          style={{ fontSize: 11, color: "var(--c-faint)", letterSpacing: "0.07em" }}
        >
          AMOUNT
        </span>
        <span style={{ fontSize: 12, color: "var(--c-steel)" }}>
          {mode === "stake" ? "Available" : "Staked"}:{" "}
          <span className="mono">{formatUsd(maxWei)}</span>
        </span>
      </div>

      <div className={styles.inputWrap}>
        <span className={styles.dollar}>$</span>
        <input
          className={styles.input}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          inputMode="decimal"
          placeholder="0.00"
          autoFocus
        />
      </div>

      <div className={styles.quick}>
        {[0.25, 0.5, 1].map((p) => (
          <Button key={p} variant="ghost" size="sm" style={{ flex: 1 }} onClick={() => setPct(p)}>
            {p === 1 ? "Max" : `${p * 100}%`}
          </Button>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.sumRow}>
          <span style={{ color: "var(--c-steel)" }}>Est. first-year yield</span>
          <span className="mono" style={{ color: "var(--c-lume)", fontWeight: 600 }}>
            {amount && validation.ok ? formatUsdNumber(Number(amount) * vaultApy(vault)) : "—"}
          </span>
        </div>
      </div>

      {preview && <TxPreview preview={preview} />}

      {validation.error && <div className={styles.error}>{validation.error}</div>}

      <Button style={{ width: "100%", marginTop: 18 }} disabled={!validation.ok} onClick={submit}>
        {mode === "stake" ? "Stake & start earning" : "Unstake"}
      </Button>
    </Modal>
  );
}
