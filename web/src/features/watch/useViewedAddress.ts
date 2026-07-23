import { useAccount } from "wagmi";
import { useWatchStore } from "./watch-store";

/**
 * Every data hook reads from here instead of useAccount(), so watch-only mode
 * works everywhere without touching a single component.
 */
export function useViewedAddress(): {
  address: `0x${string}` | undefined;
  isWatchOnly: boolean;
} {
  const { address: connected } = useAccount();
  const watching = useWatchStore((s) => s.watching);

  if (watching) return { address: watching, isWatchOnly: true };
  return { address: connected, isWatchOnly: false };
}
