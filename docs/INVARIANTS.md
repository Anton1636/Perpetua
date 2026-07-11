# Perpetua - System Invariants

Statements that must hold at all times. Checked in the frontend (dev builds) via
`shared/lib/invariants.ts` after every state change, and fuzzed on-chain by
Foundry invariant tests. One source of truth, two enforcement layers.

## Accounting

- **I1 - Non-negative accrued.** A position's accrued rewards are never negative.
- **I2 - Positive held assets.** Any position held in state has `assets > 0`
  (fully-withdrawn positions are removed, not kept at zero).
- **I3 - Principal ≤ assets.** Deposited principal never exceeds current assets;
  a user cannot have withdrawn more value than the position holds.
- **I4 - Non-negative wallet.** The available (wallet) balance is never negative.

## Conservation (checked in tests)

- **C1 - Stake conservation.** After a stake of `x`: `available` decreases by `x`
  and vault assets increase by `x`. Total value is unchanged.
- **C2 - Unstake conservation.** After an unstake of `x`: vault assets decrease
  by `x`, `available` increases by `x` (+ accrued on a full exit). Nothing is
  created or destroyed.
- **C3 - Compound conservation.** Compounding moves `accrued` into `assets`;
  the sum `assets + accrued` across all positions is unchanged.

## On-chain

- **V1 - Solvency.** The vault never owes more assets than it holds.
- **V2 - Share pricing monotonicity.** `convertToAssets(shares)` is monotonic;
  no deposit/withdraw sequence lets a user extract more than they put in
  (inflation-attack resistance via decimals offset).
- **V3 - Mint authority.** Only the vault (MINTER_ROLE) can mint yield tokens.
