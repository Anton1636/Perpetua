import { useEffect, useRef, useState } from "react";
import { toNumber } from "@/shared/lib/format";

const YEAR_SECONDS = 365 * 24 * 3600;

/**
 * Smoothly ticks an accrued reward figure in real time for display.
 * Input: current accrued (bigint wei) + total staked (bigint wei) + blended APY.
 * The per-second rate = staked * apy / yearSeconds. Purely a display animation;
 */
export function useLiveAccrual(accruedWei: bigint, stakedWei: bigint, apyFraction: number): number {
  const [display, setDisplay] = useState(() => toNumber(accruedWei));
  const raf = useRef(0);
  const last = useRef(0); // set inside effects (never read performance.now during render)
  const value = useRef(0);

  // reset the base whenever fresh data arrives
  useEffect(() => {
    value.current = toNumber(accruedWei);
    setDisplay(value.current);
    last.current = performance.now();
  }, [accruedWei]);

  useEffect(() => {
    last.current = performance.now();
    const ratePerSecond = (toNumber(stakedWei) * apyFraction) / YEAR_SECONDS;
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      value.current += ratePerSecond * dt;
      setDisplay(value.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [stakedWei, apyFraction]);

  return display;
}
