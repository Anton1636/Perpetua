import { useEffect } from "react";
import { useVaults, vaultApy } from "@/entities/vault/model";
import { usePositionStore } from "@/entities/position/store";
import { toNumber, toWei } from "@/shared/lib/format";
import { TimeProvider } from "@/shared/lib/time";

const YEAR_SECONDS = 365 * 24 * 3600;

export function AccrualTicker() {
  const { data: vaults } = useVaults();
  const accrue = usePositionStore((s) => s.accrue);

  useEffect(() => {
    if (!vaults) return;
    const rates: Record<string, number> = {};
    vaults.forEach((v) => (rates[v.address] = vaultApy(v)));

    let last = TimeProvider.virtualNow();
    const id = setInterval(() => {
      const vnow = TimeProvider.virtualNow();
      const dt = (vnow - last) / 1000; // virtual seconds (scaled by speed)
      last = vnow;
      const { positions } = usePositionStore.getState();
      const deltas: Record<string, bigint> = {};
      for (const p of positions) {
        const apy = rates[p.vaultAddress] ?? 0;
        const inc = (toNumber(p.assets) * apy * dt) / YEAR_SECONDS;
        if (inc > 0) deltas[p.vaultAddress] = toWei(inc.toFixed(9));
      }
      if (Object.keys(deltas).length) accrue(deltas);
    }, 1000);
    return () => clearInterval(id);
  }, [vaults, accrue]);

  return null;
}
