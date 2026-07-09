import { create } from "zustand";
import type { Position } from "./types";
import { MOCK_POSITIONS } from "./mock";
import { toWei } from "@/shared/lib/format";

// Client state during the mock phase. Actions return booleans so the UI can
// distinguish success from a rejected action (guards are the last line of
// defense — validation in the modal is not enough on its own).
export const INITIAL_AVAILABLE = toWei("20000");

interface PositionState {
  positions: Position[];
  available: bigint; // free wallet balance, wei
  stake: (vault: `0x${string}`, amountWei: bigint) => boolean;
  unstake: (vault: `0x${string}`, amountWei: bigint) => boolean;
  compoundAll: () => bigint; // returns the amount compounded
  accrue: (deltas: Record<string, bigint>) => void;
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: MOCK_POSITIONS.map((p) => ({ ...p })),
  available: INITIAL_AVAILABLE,

  stake: (vault, amountWei) => {
    let ok = false;
    set((state) => {
      if (amountWei <= 0n || amountWei > state.available) return state; // guard
      ok = true;
      const existing = state.positions.find((p) => p.vaultAddress === vault);
      const positions = existing
        ? state.positions.map((p) =>
            p.vaultAddress === vault
              ? { ...p, assets: p.assets + amountWei, principal: p.principal + amountWei }
              : p,
          )
        : [
            ...state.positions,
            { vaultAddress: vault, assets: amountWei, principal: amountWei, accrued: 0n },
          ];
      return { positions, available: state.available - amountWei };
    });
    return ok;
  },

  unstake: (vault, amountWei) => {
    let ok = false;
    set((state) => {
      const pos = state.positions.find((p) => p.vaultAddress === vault);
      if (!pos || amountWei <= 0n || amountWei > pos.assets) return state; // guard
      ok = true;
      const assetsAfter = pos.assets - amountWei;
      // principal shrinks proportionally to the withdrawn share (keeps PnL honest)
      const principalCut = (pos.principal * amountWei) / pos.assets;
      // full exit also claims pending rewards back to the wallet (nothing vanishes)
      const claimedAccrued = assetsAfter === 0n ? pos.accrued : 0n;

      const positions = state.positions
        .map((p) =>
          p.vaultAddress === vault
            ? {
                ...p,
                assets: assetsAfter,
                principal: p.principal - principalCut,
                accrued: assetsAfter === 0n ? 0n : p.accrued,
              }
            : p,
        )
        .filter((p) => p.assets > 0n);

      return { positions, available: state.available + amountWei + claimedAccrued };
    });
    return ok;
  },

  compoundAll: () => {
    let compounded = 0n;
    set((state) => {
      compounded = state.positions.reduce((s, p) => s + p.accrued, 0n);
      if (compounded === 0n) return state;
      return {
        positions: state.positions.map((p) => ({
          ...p,
          assets: p.assets + p.accrued,
          accrued: 0n,
        })),
      };
    });
    return compounded;
  },

  accrue: (deltas) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        deltas[p.vaultAddress] ? { ...p, accrued: p.accrued + deltas[p.vaultAddress] } : p,
      ),
    })),
}));
