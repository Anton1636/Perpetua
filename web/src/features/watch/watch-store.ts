import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WatchedAccount {
  address: `0x${string}`;
  label: string;
}

interface WatchState {
  watching: `0x${string}` | null; // session-only, intentionally not persisted
  watchlist: WatchedAccount[]; // persisted across sessions
  watch: (address: `0x${string}`) => void;
  stopWatching: () => void;
  addToWatchlist: (account: WatchedAccount) => void;
  removeFromWatchlist: (address: `0x${string}`) => void;
}

// Client-side preferences only. Note what is NOT here: balances, positions,
// money. Those live on-chain (Day 19). Zustand is back for what it's good at.
export const useWatchStore = create<WatchState>()(
  persist(
    (set) => ({
      watching: null,
      watchlist: [],

      watch: (address) => set({ watching: address }),
      stopWatching: () => set({ watching: null }),

      addToWatchlist: (account) =>
        set((s) =>
          s.watchlist.some((a) => a.address.toLowerCase() === account.address.toLowerCase())
            ? s
            : { watchlist: [...s.watchlist, account] },
        ),

      removeFromWatchlist: (address) =>
        set((s) => ({
          watchlist: s.watchlist.filter((a) => a.address.toLowerCase() !== address.toLowerCase()),
        })),
    }),
    {
      name: "perpetua-watchlist",
      // Only the saved list survives a reload — a fresh session always starts
      // on YOUR portfolio, never silently viewing someone else's.
      partialize: (s) => ({ watchlist: s.watchlist }),
    },
  ),
);
