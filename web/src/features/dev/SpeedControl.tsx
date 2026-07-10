import { useState } from "react";
import { FastForward } from "lucide-react";
import { TimeProvider } from "@/shared/lib/time";

// Hidden demo tool: accelerate the accrual clock to SEE compounding happen.
// A year of yield in ~30s makes the "time does the work" thesis tangible in a
// recruiter demo.
const SPEEDS = [1, 100, 1000, 10000];

export function SpeedControl() {
  const [speed, setSpeed] = useState(1);
  const [open, setOpen] = useState(false);

  const pick = (s: number) => {
    TimeProvider.setSpeed(s);
    setSpeed(s);
  };

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 70 }}>
      {open ? (
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            background: "var(--c-surface3)",
            border: "1px solid var(--c-line2)",
            borderRadius: 999,
            padding: "6px 8px",
            boxShadow: "var(--e-3)",
          }}
        >
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => pick(s)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 12,
                fontFamily: "var(--f-mono)",
                background: speed === s ? "var(--c-lume)" : "transparent",
                color: speed === s ? "#141a10" : "var(--c-steel)",
              }}
            >
              ×{s}
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--c-faint)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Time speed"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: "var(--c-surface3)",
            border: "1px solid var(--c-line2)",
            color: "var(--c-lume)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--e-3)",
          }}
        >
          <FastForward size={16} />
        </button>
      )}
    </div>
  );
}
