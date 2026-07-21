import { useMemo, useState } from "react";
import { Modal, Button } from "@/shared/ui";
import { useOnChainPositions } from "@/entities/position/chain";
import { useZapOnChain } from "./useZapOnChain";
import { formatUsd, toWei, toNumber } from "@/shared/lib/format";

interface Props {
  open: boolean;
  onClose: () => void;
}

// Unlike StakeModal (closes immediately, one or two txs), Zap can involve
// several approvals + one batched deposit — so this modal stays open and shows
// progress until the whole flow settles.
export function ZapModal({ open, onClose }: Props) {
  const { data } = useOnChainPositions();
  const { zap, isZapping } = useZapOnChain();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const rows = useMemo(() => data ?? [], [data]);

  const selected = useMemo(() => {
    const out: { symbol: string; vaultAddress: `0x${string}`; amountWei: bigint }[] = [];
    for (const r of rows) {
      const raw = amounts[r.symbol];
      if (!raw || Number(raw) <= 0) continue;
      try {
        out.push({ symbol: r.symbol, vaultAddress: r.vaultAddress, amountWei: toWei(raw) });
      } catch {
        // ignore transient malformed input (e.g. trailing ".") while typing
      }
    }
    return out;
  }, [rows, amounts]);

  const totalWei = selected.reduce((s, x) => s + x.amountWei, 0n);

  const submit = async () => {
    if (selected.length < 1) return;
    await zap(selected);
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()} title="Zap into multiple vaults">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.symbol} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{ width: 56, fontSize: 13 }}>
              {r.symbol}
            </span>
            <input
              value={amounts[r.symbol] ?? ""}
              onChange={(e) =>
                setAmounts((a) => ({ ...a, [r.symbol]: e.target.value.replace(/[^0-9.]/g, "") }))
              }
              placeholder="0.00"
              inputMode="decimal"
              style={{
                flex: 1,
                padding: "8px 10px",
                background: "var(--c-bg)",
                border: "1px solid var(--c-line)",
                borderRadius: "var(--r-sm)",
                color: "var(--c-cream)",
                fontFamily: "var(--f-mono)",
                fontSize: 13,
              }}
            />
            <button
              onClick={() =>
                setAmounts((a) => ({ ...a, [r.symbol]: toNumber(r.walletBalance).toString() }))
              }
              style={{
                fontSize: 11,
                color: "var(--c-lume)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Max {formatUsd(r.walletBalance)}
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "10px 12px",
          background: "var(--c-surface1)",
          borderRadius: "var(--r-md)",
          fontSize: 13,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "var(--c-steel)" }}>{selected.length} vaults selected</span>
        <span className="mono" style={{ color: "var(--c-lume)", fontWeight: 600 }}>
          {formatUsd(totalWei)}
        </span>
      </div>

      <Button
        style={{ width: "100%", marginTop: 16 }}
        disabled={selected.length < 1 || isZapping}
        onClick={submit}
      >
        {isZapping
          ? "Zapping…"
          : `Stake into ${selected.length || ""} vault${selected.length === 1 ? "" : "s"}`}
      </Button>
    </Modal>
  );
}
