import { Eye, X } from "lucide-react";
import { useWatchStore } from "./watch-store";
import { useViewedAddress } from "./useViewedAddress";

export function WatchBanner() {
  const { address, isWatchOnly } = useViewedAddress();
  const stopWatching = useWatchStore((s) => s.stopWatching);

  if (!isWatchOnly || !address) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        marginTop: 10,
        borderRadius: "var(--r-md)",
        background: "var(--c-amberDim)",
        border: "1px solid rgba(231,163,62,0.35)",
      }}
    >
      <Eye size={16} color="var(--c-amber)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-amber)" }}>
          Watch-only mode
        </div>
        <div className="mono" style={{ fontSize: 12, color: "var(--c-steel)" }}>
          Viewing {address.slice(0, 6)}…{address.slice(-4)} · actions disabled
        </div>
      </div>
      <button
        onClick={stopWatching}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: "var(--r-sm)",
          background: "transparent",
          border: "1px solid rgba(231,163,62,0.4)",
          color: "var(--c-amber)",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <X size={13} /> Exit
      </button>
    </div>
  );
}
