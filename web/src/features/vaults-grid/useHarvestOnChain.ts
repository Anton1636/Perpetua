import { useWriteContract } from "wagmi";
import { useTxFlow } from "@/shared/web3/use-tx-flow";
import { autoCompounderAbi } from "@/shared/web3/generated";
import { CONTRACTS } from "@/shared/web3/addresses";

// Anyone can trigger a vault's harvest via the keeper. This realizes
// pending yield into the vault, which then streams into share price over the
// next 8h (anti-sandwich design) instead of jumping instantly. Rate-limited
// on-chain (1h/vault) — a too-soon revert shows a generic error for now
export function useHarvestOnChain() {
  const { writeContractAsync } = useWriteContract();
  const { run } = useTxFlow();

  const harvest = async (vaultAddress: `0x${string}`) => {
    await run({
      kind: "compound",
      vaultAddress,
      amount: 0n, // harvested amount isn't known client-side before mining
      pendingTitle: "Triggering harvest",
      successTitle: "Harvest triggered",
      successDesc: "Yield is now streaming into the vault",
      write: () =>
        writeContractAsync({
          address: CONTRACTS.keeper,
          abi: autoCompounderAbi,
          functionName: "poke",
          args: [vaultAddress],
        }),
    });
  };

  return { harvest };
}
