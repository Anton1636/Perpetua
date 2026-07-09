import { useState } from "react";
import { formatUsdPrecise } from "@/shared/lib/format";
import { toWei } from "@/shared/lib/format";
import styles from "./ChronometerDial.module.css";

interface Props {
  liveAccrual: number; // live-ticking accrued value (from useLiveAccrual)
}

// The signature element: a working chronometer. The sub-dial shows the reward
// accruing in real time — the product's whole thesis (time does the work).
export function ChronometerDial({ liveAccrual }: Props) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  };

  const transform = `perspective(1100px) rotateX(${(-tilt.y * 7).toFixed(2)}deg) rotateY(${(tilt.x * 9).toFixed(2)}deg)`;

  return (
    <div
      className={styles.dial}
      style={{ transform }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className={styles.bezel} />
      <div className={styles.face}>
        <div className={styles.guilloche} />
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className={`${styles.tick} ${i % 5 === 0 ? styles.tickMajor : styles.tickMinor}`}
            style={{ transform: `rotate(${i * 6}deg)` }}
          />
        ))}
        <div className={styles.brandArc}>PERPETUA</div>
        <div className={styles.subdial}>
          <span className={styles.subLabel}>ACCRUING</span>
          <span className={styles.subValue}>
            {/* reuse the precise formatter by wrapping the live number back to wei-ish display */}
            {formatUsdPrecise(toWei(liveAccrual.toFixed(6)))}
          </span>
        </div>
      </div>
      <div className={`${styles.hand} ${styles.handHour}`}>
        <i />
      </div>
      <div className={`${styles.hand} ${styles.handMinute}`}>
        <i />
      </div>
      <div className={styles.seconds}>
        <i />
      </div>
      <div className={styles.cap} />
      <div className={styles.crown} />
      <div className={styles.glass} />
    </div>
  );
}
