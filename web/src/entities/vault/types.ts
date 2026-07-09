// Vault as it will arrive from the contract: amounts are bigint (18-dec wei).
// Yields stay as plain % numbers (they are protocol config, not on-chain money).
export type Risk = "low" | "medium";

export interface Vault {
  address: `0x${string}`; // vault contract address (mock for now)
  symbol: string; // e.g. "Ox"
  name: string; // e.g. "Realty Income"
  dividendPct: number; // annual dividend yield, %
  stakingPct: number; // annual staking yield, %
  risk: Risk;
  tag: string; // "Monthly payer", "Dividend King", ...
  pricePerShare: bigint; // asset price, wei
  tvl: bigint; // total value locked, wei
}
