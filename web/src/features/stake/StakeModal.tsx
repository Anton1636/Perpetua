import { useEffect, useState } from "react";
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
import { useSimulate } from "@/shared/web3/use-simulate";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import styles from "./StakeModal.module.css";

interface Props {
  vault: Vault | null;
  mode: "stake" | "unstake";
  onClose: () => void;
}

interface BodyProps {
  vault: Vault;
  mode: "stake" | "unstake";
  onClose: () => void;
}

function sanitizeDecimal(raw: string): string {
  const [int, ...rest] = raw
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
    .split(".");
  return rest.length ? `${int}.${rest.join("").slice(0, 2)}` : int;
}

/**
 * Gate + remount boundary. The `key` gives a fresh state tree whenever the vault
 * or the mode changes, which is why the body below needs no reset effect.
 */
export function StakeModal({ vault, mode, onClose }: Props) {
  if (!vault) return null;
  return (
    <StakeModalBody key={`${vault.address}:${mode}`} vault={vault} mode={mode} onClose={onClose} />
  );
}

function StakeModalBody({ vault, mode, onClose }: BodyProps) {
  const [amount, setAmount] = useState("");
  const [presetWei, setPresetWei] = useState<bigint | null>(null);

  const { stake, unstake } = useStakeActions();
  const positions = usePositions();
  const available = useAvailable();
  const { simulate, result } = useSimulate();

  const position = positions.find((p) => p.vaultAddress === vault.address);
  const maxWei = mode === "stake" ? available : (position?.assets ?? 0n);

  const parsed = amountSchema(maxWei).safeParse(amount);
  const validationError = parsed.success ? "" : (parsed.error.issues[0]?.message ?? "");

  // presetWei holds the exact bigint behind a %-button; typing clears it
  const amountWei = presetWei ?? (parsed.success && amount ? toWei(amount) : 0n);

  const deployment = vaultBySymbol(vault.symbol);
  const vaultAddress = deployment?.vault;

  // Identifies the exact input a simulation belongs to. null = nothing to simulate.
  const simKey =
    vaultAddress && parsed.success && amountWei > 0n
      ? `${mode}:${vaultAddress}:${amountWei}`
      : null;

  useEffect(() => {
    if (!simKey || !vaultAddress) return;
    const t = setTimeout(() => {
      simulate({ key: simKey, mode, vault: vaultAddress, amountWei });
    }, 500);
    return () => clearTimeout(t);
  }, [simKey, vaultAddress, mode, amountWei, simulate]);

  // A result is trusted only while it matches the current input — nothing to reset
  const sim = simKey && result?.key === simKey ? result : null;
  const isSimulating = simKey !== null && sim === null;

  const preview =
    amountWei > 0n && parsed.success
      ? mode === "stake"
        ? previewStake(amountWei, available, position)
        : previewUnstake(amountWei, available, position)
      : null;

  // an allowance revert is expected before approve — it must not block
  const simBlocked = isSimulating || (!!sim && !sim.ok && !sim.needsApproval);
  const canSubmit = parsed.success && !!deployment && amountWei > 0n && !simBlocked;

  const submit = () => {
    if (!canSubmit || !deployment) return;
    if (mode === "stake") stake(deployment, amountWei);
    else unstake(deployment, amountWei);
    onClose();
  };

  const setPct = (pct: number) => {
    const bps = BigInt(Math.round(pct * 10_000));
    const exact = (maxWei * bps) / 10_000n; // exact, never above balance
    setPresetWei(exact);
    setAmount(String(Math.floor(toNumber(exact) * 100) / 100)); // display only
  };

  return (
    <Modal
      open
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
            setPresetWei(null);
            setAmount(sanitizeDecimal(e.target.value));
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
            {amountWei > 0n ? formatUsdNumber(toNumber(amountWei) * vaultApy(vault)) : "—"}
          </span>
        </div>
      </div>

      {preview && <TxPreview preview={preview} />}

      {simKey && (
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
          ) : sim?.needsApproval ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                color: "var(--c-amber)",
              }}
            >
              <ShieldCheck size={13} /> Approval required — you&apos;ll sign two transactions
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                color: "var(--c-red)",
              }}
            >
              <AlertTriangle size={13} /> {sim?.error}
            </span>
          )}
        </div>
      )}

      {validationError && <div className={styles.error}>{validationError}</div>}

      <Button style={{ width: "100%", marginTop: 18 }} disabled={!canSubmit} onClick={submit}>
        {mode === "stake" ? "Stake & start earning" : "Unstake"}
      </Button>
    </Modal>
  );
}
