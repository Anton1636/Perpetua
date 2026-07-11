# Perpetua - Architecture

## Protocol vs Product

Perpetua is split into two layers that are designed to be independent:

- **Protocol** - the smart contracts (ERC-4626 vaults, factory, keeper), their
  invariants, and the subgraph. The protocol is usable _without_ this frontend:
  anyone can integrate the vaults directly. This is the source of truth.
- **Product** - this web app is _one client_ of the protocol. It never holds
  authority; it reads on-chain state and submits transactions the user signs.

This separation drives every decision: if a feature would put authority or truth
in the frontend, it belongs in the protocol instead.

## The seam (mock → chain)

Domain data flows through hooks in `entities/*` (`useVaults`, `usePositions`).
Today they resolve mocks in **chain shape** (bigint, 18 decimals). The
data source becomes contract reads; components never change. Amounts are bigint
everywhere; human formatting happens only at the edge in `shared/lib/format.ts`.

## Units rule

The UI and the position store operate in **assets** (USD value, wei). ERC-4626
**shares** exist only on-chain; the chain adapter converts
`shares → assets` at the edge. This makes unit-mixing bugs impossible by
construction.

## Derived state law

The store holds only **primary** data: `positions`, `available`, and the event
log. Everything else - totals, blended APY, allocation, PnL - is a **pure
selector** over that primary data. Never store what you can derive; a stored
derivative is a future desync (that class of bug was caught once already).

## Event log as source of truth

Financial state is a **journal of operations**; balances are a snapshot derived
from it. `entities/activity` is the primary ledger - every action appends an
event (pending → confirmed/failed). Activity renders it, PnL folds it, and on
Day 16 the records originate from contract events. Same shape, different origin.

## Preview / simulate pattern

Every action has a pure `previewX()` twin that computes the outcome without
mutating state. The modal shows it before the user commits; tests assert
`apply(preview) == execute()`; it is backed by `simulateContract`.

## Controllable time

All time-based logic reads `shared/lib/time.ts` (`TimeProvider`), so tests can
warp forward and the demo can run at ×N speed. Mirrors `vm.warp` in contracts.
