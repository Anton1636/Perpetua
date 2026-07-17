import { useState } from "react";
import { RefreshCw, Zap as ZapIcon } from "lucide-react";
import { Card, Skeleton, Button, useToast } from "@/shared/ui";
import { useVaults } from "@/entities/vault/model";
import { usePositions } from "@/entities/position/model";
import type { Vault } from "@/entities/vault/types";
import { VaultCard } from "./VaultCard";
import { StakeModal } from "@/features/stake/StakeModal";
import { ZapModal } from "@/features/zap/ZapModal";
import { useHarvestOnChain } from "./useHarvestOnChain";
import styles from "./VaultsGrid.module.css";

export function VaultsGrid() {
  const vaults = useVaults();
  const positions = usePositions();
  const toast = useToast();
  const { harvest } = useHarvestOnChain();

  const [modal, setModal] = useState<{ vault: Vault; mode: "stake" | "unstake" } | null>(null);
  const [zapOpen, setZapOpen] = useState(false);

  const onHarvestAll = async () => {
    if (positions.length === 0) {
      toast({ kind: "warning", title: "No active positions", desc: "Stake in a vault first" });
      return;
    }
    for (const p of positions) {
      await harvest(p.vaultAddress);
    }
  };

  return (
    <div>
      <div className={styles.head}>
        <span className={styles.label}>Vaults</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => setZapOpen(true)}>
            <ZapIcon size={14} /> Zap stake
          </Button>
          <Button variant="ghost" size="sm" onClick={onHarvestAll}>
            <RefreshCw size={14} /> Harvest my vaults
          </Button>
        </div>
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
      <ZapModal open={zapOpen} onClose={() => setZapOpen(false)} />
    </div>
  );
}
