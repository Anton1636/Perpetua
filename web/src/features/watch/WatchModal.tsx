import { useState } from "react";
import { isAddress } from "viem";
import { Eye, Trash2 } from "lucide-react";
import { Modal, Button } from "@/shared/ui";
import { useWatchStore } from "./watch-store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function WatchModal({ open, onClose }: Props) {
  const [input, setInput] = useState("");
  const [label, setLabel] = useState("");
  const { watchlist, watch, addToWatchlist, removeFromWatchlist } = useWatchStore();

  const valid = isAddress(input.trim());

  const startWatching = (address: `0x${string}`) => {
    watch(address);
    onClose();
  };

  const saveAndWatch = () => {
    if (!valid) return;
    const address = input.trim() as `0x${string}`;
    addToWatchlist({
      address,
      label: label.trim() || `${address.slice(0, 6)}…${address.slice(-4)}`,
    });
    startWatching(address);
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()} title="Watch an address">
      <p style={{ color: "var(--c-steel)", fontSize: 13, marginBottom: 14 }}>
        View any wallet's positions read-only — no connection needed.
      </p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="0x…"
        spellCheck={false}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "var(--c-bg)",
          border: `1px solid ${input && !valid ? "var(--c-red)" : "var(--c-line)"}`,
          borderRadius: "var(--r-md)",
          color: "var(--c-cream)",
          fontFamily: "var(--f-mono)",
          fontSize: 13,
        }}
      />
      {input && !valid && (
        <div style={{ color: "var(--c-red)", fontSize: 12, marginTop: 6 }}>Not a valid address</div>
      )}

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (optional)"
        style={{
          width: "100%",
          marginTop: 8,
          padding: "10px 12px",
          background: "var(--c-bg)",
          border: "1px solid var(--c-line)",
          borderRadius: "var(--r-md)",
          color: "var(--c-cream)",
          fontSize: 13,
        }}
      />

      <Button style={{ width: "100%", marginTop: 12 }} disabled={!valid} onClick={saveAndWatch}>
        <Eye size={15} /> Watch this address
      </Button>

      {watchlist.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div
            className="label"
            style={{
              fontSize: 11,
              color: "var(--c-faint)",
              letterSpacing: "0.07em",
              marginBottom: 8,
            }}
          >
            SAVED
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {watchlist.map((a) => (
              <div key={a.address} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => startWatching(a.address)}
                  style={{
                    flex: 1,
                    textAlign: "left",
                    padding: "9px 12px",
                    background: "var(--c-surface1)",
                    border: "1px solid var(--c-line)",
                    borderRadius: "var(--r-sm)",
                    color: "var(--c-cream)",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {a.label}
                  <span
                    className="mono"
                    style={{ color: "var(--c-faint)", fontSize: 11, marginLeft: 8 }}
                  >
                    {a.address.slice(0, 6)}…{a.address.slice(-4)}
                  </span>
                </button>
                <button
                  onClick={() => removeFromWatchlist(a.address)}
                  aria-label="Remove"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--c-faint)",
                    cursor: "pointer",
                    padding: 6,
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
