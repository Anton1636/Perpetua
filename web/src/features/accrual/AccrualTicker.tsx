import { useEffect } from "react";
import { useVaults, vaultApy } from "@/entities/vault/model";
import { usePositionStore } from "@/entities/position/store";
import { toNumber, toWei } from "@/shared/lib/format";

const YEAR_SECONDS = 365 * 24 * 3600;

// Headless: every 5s writes real accrual into the store so the dial, vault
// cards and Compound all agree on ONE truth. The rAF hook remains a smooth
// animation layer on top and re-syncs to this base on every write.
export function AccrualTicker() {
  const { data: vaults } = useVaults();
  const accrue = usePositionStore((s) => s.accrue);

  useEffect(() => {
    if (!vaults) return;
    const rates: Record<string, number> = {};
    vaults.forEach((v) => (rates[v.address] = vaultApy(v)));

    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const { positions } = usePositionStore.getState();
      const deltas: Record<string, bigint> = {};
      for (const p of positions) {
        const apy = rates[p.vaultAddress] ?? 0;
        const inc = (toNumber(p.assets) * apy * dt) / YEAR_SECONDS;
        if (inc > 0) deltas[p.vaultAddress] = toWei(inc.toFixed(9));
      }
      if (Object.keys(deltas).length) accrue(deltas);
    }, 5000);
    return () => clearInterval(id);
  }, [vaults, accrue]);

  return null;
}
