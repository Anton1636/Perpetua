# Press Release (working backwards)

**Perpetua - put your tokenized dividend stocks to work, automatically.**

Today we're releasing Perpetua, a non-custodial vault protocol that turns
tokenized dividend equities into a self-compounding portfolio. Stake a tokenized
stock (e.g. a Realty Income or Coca-Cola token), and Perpetua automatically
collects its dividend stream and staking yield and reinvests it - a DRIP that
runs 24/7 without you lifting a finger.

## The problem

Tokenized equities are arriving on-chain (Binance bStocks, Backed xStocks, and
others), bringing thousands of real dividend-paying stocks to crypto rails. But
holding a tokenized dividend stock is passive: dividends trickle in and sit idle.
In traditional finance, dividend reinvestment plans (DRIPs) solved this decades
ago - on-chain, the tooling didn't exist.

## The solution

Perpetua is a set of ERC-4626 vaults, one per tokenized equity. Deposit your
tokens and the vault:

- collects the underlying dividend stream (pass-through from the issuer),
- earns additional yield by lending the assets to on-chain markets,
- auto-compounds everything back into your position.

You keep custody until you stake; withdrawals are permissionless; every action is
simulated before you sign.

## Who it's for

Long-term, dividend-oriented investors who want tradfi's compounding discipline
with DeFi's transparency and automation - with first-class tax export for the
German market (KESt-ready reporting).

## How it works (trust model)

- **Non-custodial.** Funds move only when you stake; the vault can't touch your
  wallet otherwise.
- **Emitter-agnostic.** Vaults are keyed by token address, not brand - any
  compliant tokenized-equity issuer can plug in.
- **Yield sources are explicit.** Dividend pass-through + securities lending. No
  mystery APY. (In this demo, yield is _simulated_ on testnet.)
- **Verified & audited.** Contracts are source-verified on Etherscan; the vault
  math is fuzzed against a written invariant set.

## Status

Demo on Sepolia testnet with simulated yield. Not investment advice. See the
README's "Path to production" for the regulatory and operational work required
to run this on mainnet with real assets.
