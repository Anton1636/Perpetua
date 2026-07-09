// A user's stake in a vault. shares/accrued are bigint wei, chain-shaped.
export interface Position {
  vaultAddress: `0x${string}`;
  shares: bigint; // vault shares held
  principal: bigint; // assets originally deposited, wei
  accrued: bigint; // rewards accrued so far, wei
}
