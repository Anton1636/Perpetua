import { useMemo, useState, useEffect } from "react";
import { Modal, Button } from "@/shared/ui";
import type { Vault } from "@/entities/vault/types";
import { usePositions, useAvailable } from "@/entities/position/model";
import { useStakeActions } from "./useStakeActions";
import { amountSchema } from "./schema";
import { previewStake, previewUnstake } from "@/entities/position/preview";
import { TxPreview } from "@/features/security/TxPreview";
import { formatUsd, formatUsdNumber, formatPct, toWei, toNumber } from "@/shared/lib/format";
import { vaultApy } from "@/entities/vault/model";
import { vaultBySymbol } from "@/shared/web3/addresses";
import styles from "./StakeModal.module.css";
import { useSimulate } from "@/shared/web3/use-simulate";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
interface Props {
  vault: Vault | null;
  mode: "stake" | "unstake";
  onClose: () => void;
}

export function StakeModal({ vault, mode, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [isMax, setIsMax] = useState(false);

  const { stake, unstake } = useStakeActions();
  const positions = usePositions();
  const available = useAvailable();

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

  const deployment = vault ? vaultBySymbol(vault.symbol) : undefined;

  const { simulate, result: sim, isSimulating, reset: resetSim } = useSimulate();

  useEffect(() => {
    if (!vault || !deployment || !validation.ok || !amount) {
      resetSim();
      return;
    }
    const amountWei = isMax ? maxWei : toWei(amount);
    const t = setTimeout(() => {
      simulate({ mode, vault: deployment.vault, amountWei });
    }, 500);
    return () => clearTimeout(t);
  }, [amount, validation.ok, mode, vault, deployment, isMax, maxWei, simulate, resetSim]);

  if (!vault) return null;

  const preview = (() => {
    if (!amount || !validation.ok) return null;
    const position = positions.find((p) => p.vaultAddress === vault.address);
    const amt = isMax ? maxWei : toWei(amount);
    return mode === "stake"
      ? previewStake(amt, available, position)
      : previewUnstake(amt, available, position);
  })();

  const submit = () => {
    if (!validation.ok || !deployment) return;
    const amountWei = isMax ? maxWei : toWei(amount);
    if (mode === "stake") stake(deployment, amountWei);
    else unstake(deployment, amountWei);
    onClose();
  };

  const setPct = (pct: number) => {
    setIsMax(pct === 1);
    setAmount(String(Math.round(toNumber(maxWei) * pct)));
  };

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
          onChange={(e) => {
            setIsMax(false);
            setAmount(e.target.value.replace(/[^0-9.]/g, ""));
          }}
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

      {amount && validation.ok && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: "var(--r-md)",
            background: "var(--c-surface1)",
            border: "1px solid var(--c-line)",
            fontSize: 12.5,
          }}
        >
          {isSimulating ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--c-steel)",
              }}
            >
              <Loader2 size={13} className="spin" /> Simulating transaction…
            </span>
          ) : sim?.ok ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  color: "var(--c-lume)",
                }}
              >
                <ShieldCheck size={13} /> Simulation passed
              </span>
              <span className="mono" style={{ color: "var(--c-steel)" }}>
                ~{sim.gasCostEth} ETH gas
              </span>
            </div>
          ) : sim && !sim.ok ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                color: "var(--c-red)",
              }}
            >
              <AlertTriangle size={13} /> {sim.error}
            </span>
          ) : null}
        </div>
      )}

      {validation.error && <div className={styles.error}>{validation.error}</div>}

      <Button
        style={{ width: "100%", marginTop: 18 }}
        disabled={!validation.ok || !deployment}
        onClick={submit}
      >
        {mode === "stake" ? "Stake & start earning" : "Unstake"}
      </Button>
    </Modal>
  );
}
