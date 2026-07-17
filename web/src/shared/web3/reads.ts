import { readContracts } from "wagmi/actions";
import { wagmiConfig } from "./config";
import { dividendVaultAbi, mockEquityTokenAbi } from "./generated";
import { VAULTS } from "./addresses";

// Batches all vault reads into multicall requests. One round-trip fetches
// totalAssets + share price for every vault, instead of N separate calls.
export async function readVaultsOnChain() {
  const contracts = VAULTS.flatMap((v) => [
    { address: v.vault, abi: dividendVaultAbi, functionName: "totalAssets" } as const,
    {
      address: v.vault,
      abi: dividendVaultAbi,
      functionName: "convertToAssets",
      args: [10n ** 18n],
    } as const,
  ]);

  const results = await readContracts(wagmiConfig, { contracts });

  return VAULTS.map((v, i) => ({
    symbol: v.symbol,
    tvl: (results[i * 2]?.result as bigint) ?? 0n,
    pricePerShare: (results[i * 2 + 1]?.result as bigint) ?? 10n ** 18n,
  }));
}

// Reads the connected wallet's token balances + vault positions (shares -> assets).
export async function readUserPositionsOnChain(user: `0x${string}`) {
  // token balances (available to stake)
  const balanceCalls = VAULTS.map(
    (v) =>
      ({
        address: v.token,
        abi: mockEquityTokenAbi,
        functionName: "balanceOf",
        args: [user],
      }) as const,
  );
  // vault share balances
  const shareCalls = VAULTS.map(
    (v) =>
      ({
        address: v.vault,
        abi: dividendVaultAbi,
        functionName: "balanceOf",
        args: [user],
      }) as const,
  );

  const [balances, shares] = await Promise.all([
    readContracts(wagmiConfig, { contracts: balanceCalls }),
    readContracts(wagmiConfig, { contracts: shareCalls }),
  ]);

  // convert each user's shares -> assets (their position value)
  const assetCalls = VAULTS.map(
    (v, i) =>
      ({
        address: v.vault,
        abi: dividendVaultAbi,
        functionName: "convertToAssets",
        args: [(shares[i]?.result as bigint) ?? 0n],
      }) as const,
  );
  const assets = await readContracts(wagmiConfig, { contracts: assetCalls });

  return VAULTS.map((v, i) => ({
    symbol: v.symbol,
    vaultAddress: v.vault,
    walletBalance: (balances[i]?.result as bigint) ?? 0n,
    shares: (shares[i]?.result as bigint) ?? 0n,
    assets: (assets[i]?.result as bigint) ?? 0n,
  }));
}
