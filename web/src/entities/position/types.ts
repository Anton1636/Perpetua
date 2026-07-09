// A user's stake in a vault.
// UNIT RULE: the UI and this store operate in ASSETS (USD value, 18-dec wei).
// ERC-4626 "shares" exist only on-chain;
// shares -> assets (convertToAssets) at the edge, so unit-mixing bugs are
// impossible by construction.
export interface Position {
  vaultAddress: `0x${string}`;
  assets: bigint; // current staked value, wei
  principal: bigint; // originally deposited (net of proportional withdrawals), wei
  accrued: bigint; // rewards accrued and not yet compounded, wei
}
