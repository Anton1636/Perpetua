import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, Skeleton, Button, useToast } from "@/shared/ui";
import { useVaults } from "@/entities/vault/model";
import { usePositionStore } from "@/entities/position/store";
import { usePortfolioTotals } from "@/entities/position/model";
import { formatUsd } from "@/shared/lib/format";
import type { Vault } from "@/entities/vault/types";
import { VaultCard } from "./VaultCard";
import { StakeModal } from "@/features/stake/StakeModal";
import styles from "./VaultsGrid.module.css";
import { useActivityStore } from "@/entities/activity/store";
import { DomainError, ERROR_COPY } from "@/shared/lib/errors";

export function VaultsGrid() {
  const vaults = useVaults();
  const toast = useToast();
  const compoundAll = usePositionStore((s) => s.compoundAll);
  const totals = usePortfolioTotals();
  const begin = useActivityStore((s) => s.begin);
  const resolve = useActivityStore((s) => s.resolve);

  const [modal, setModal] = useState<{ vault: Vault; mode: "stake" | "unstake" } | null>(null);

  const onCompound = () => {
    if (totals.accrued <= 0n) {
      const c = ERROR_COPY[DomainError.NothingToCompound];
      toast({ kind: "warning", title: c.title, desc: c.desc });
      return;
    }
    const id = begin("compound", null, totals.accrued);
    toast({ kind: "pending", title: "Reinvesting rewards" });
    window.setTimeout(() => {
      const compounded = compoundAll();
      resolve(id, "confirmed", { amount: compounded });
      toast({ kind: "success", title: "Reinvested", desc: `${formatUsd(compounded)} compounded` });
    }, 1200);
  };

  return (
    <div>
      <div className={styles.head}>
        <span className={styles.label}>Vaults</span>
        <Button variant="ghost" size="sm" onClick={onCompound}>
          <RefreshCw size={14} /> Compound rewards
        </Button>
      </div>

      {vaults.isLoading ? (
        <div className={styles.skelGrid}>
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} elevation={2} style={{ padding: 18 }}>
              <Skeleton width={120} height={40} radius={12} />
              <Skeleton width={90} height={30} />
              <Skeleton height={40} />
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {vaults.data?.map((v) => (
            <VaultCard
              key={v.address}
              vault={v}
              onStake={(vault) => setModal({ vault, mode: "stake" })}
              onUnstake={(vault) => setModal({ vault, mode: "unstake" })}
            />
          ))}
        </div>
      )}

      <StakeModal
        vault={modal?.vault ?? null}
        mode={modal?.mode ?? "stake"}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
