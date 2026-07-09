import { create } from "zustand";
import type { Position } from "./types";
import { MOCK_POSITIONS } from "./mock";

// User positions as client state during the mock phase.
interface PositionState {
  positions: Position[];
  stake: (vault: `0x${string}`, amountWei: bigint, pricePerShare: bigint) => void;
  unstake: (vault: `0x${string}`, amountWei: bigint) => void;
  compoundAll: () => void;
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: MOCK_POSITIONS,

  stake: (vault, amountWei, pricePerShare) =>
    set((state) => {
      // shares minted = assets / pricePerShare (both wei, keep 18-dec scale)
      const shares = pricePerShare > 0n ? (amountWei * 10n ** 18n) / pricePerShare : amountWei;
      const existing = state.positions.find((p) => p.vaultAddress === vault);
      if (existing) {
        return {
          positions: state.positions.map((p) =>
            p.vaultAddress === vault
              ? { ...p, shares: p.shares + shares, principal: p.principal + amountWei }
              : p,
          ),
        };
      }
      return {
        positions: [
          ...state.positions,
          { vaultAddress: vault, shares, principal: amountWei, accrued: 0n },
        ],
      };
    }),

  unstake: (vault, amountWei) =>
    set((state) => ({
      positions: state.positions
        .map((p) =>
          p.vaultAddress === vault
            ? {
                ...p,
                shares: p.shares - amountWei > 0n ? p.shares - amountWei : 0n,
                principal: p.principal - amountWei > 0n ? p.principal - amountWei : 0n,
              }
            : p,
        )
        .filter((p) => p.shares > 0n),
    })),

  compoundAll: () =>
    set((state) => ({
      positions: state.positions.map((p) => ({
        ...p,
        shares: p.shares + p.accrued,
        accrued: 0n,
      })),
    })),
}));
