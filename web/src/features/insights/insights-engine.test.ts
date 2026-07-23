import { describe, it, expect } from "vitest";
import {
  buildInsights,
  idleCapitalInsights,
  unharvestedYieldInsights,
  concentrationInsights,
  type InsightInput,
} from "./insights-engine";
import { toWei } from "@/shared/lib/format";

const VAULT_A = "0x00000000000000000000000000000000000000aa" as const;
const VAULT_B = "0x00000000000000000000000000000000000000bb" as const;

const base: InsightInput = {
  positions: [],
  balances: [],
  vaults: [
    { symbol: "Ox", address: VAULT_A, apy: 0.0865 },
    { symbol: "KOx", address: VAULT_B, apy: 0.065 },
  ],
  pendingYields: {},
};

describe("idleCapitalInsights", () => {
  it("flags a meaningful idle balance", () => {
    const r = idleCapitalInsights({
      ...base,
      balances: [{ vaultAddress: VAULT_A, symbol: "Ox", walletBalance: toWei("5000") }],
    });
    expect(r).toHaveLength(1);
    expect(r[0].severity).toBe("opportunity");
    expect(r[0].actionVault).toBe(VAULT_A);
  });

  it("stays quiet below the dust threshold", () => {
    const r = idleCapitalInsights({
      ...base,
      balances: [{ vaultAddress: VAULT_A, symbol: "Ox", walletBalance: toWei("20") }],
    });
    expect(r).toHaveLength(0);
  });

  it("ranks by expected yield, not raw balance", () => {
    // B has a bigger balance but A's higher APY wins on 1000×0.0865 vs 1100×0.065
    const r = idleCapitalInsights({
      ...base,
      balances: [
        { vaultAddress: VAULT_A, symbol: "Ox", walletBalance: toWei("1000") },
        { vaultAddress: VAULT_B, symbol: "KOx", walletBalance: toWei("1100") },
      ],
    });
    expect(r[0].actionVault).toBe(VAULT_A);
  });
});

describe("unharvestedYieldInsights", () => {
  it("suggests a harvest when yield is waiting", () => {
    const r = unharvestedYieldInsights({
      ...base,
      positions: [{ vaultAddress: VAULT_A, assets: toWei("1000") }],
      pendingYields: { [VAULT_A.toLowerCase()]: toWei("12.4") },
    });
    expect(r).toHaveLength(1);
    expect(r[0].actionLabel).toBe("Harvest");
  });

  it("ignores dust amounts", () => {
    const r = unharvestedYieldInsights({
      ...base,
      positions: [{ vaultAddress: VAULT_A, assets: toWei("1000") }],
      pendingYields: { [VAULT_A.toLowerCase()]: toWei("0.2") },
    });
    expect(r).toHaveLength(0);
  });
});

describe("concentrationInsights", () => {
  it("warns when one vault dominates", () => {
    const r = concentrationInsights({
      ...base,
      positions: [
        { vaultAddress: VAULT_A, assets: toWei("9000") },
        { vaultAddress: VAULT_B, assets: toWei("1000") },
      ],
    });
    expect(r).toHaveLength(1);
    expect(r[0].severity).toBe("warning");
  });

  it("stays quiet on a balanced portfolio", () => {
    const r = concentrationInsights({
      ...base,
      positions: [
        { vaultAddress: VAULT_A, assets: toWei("5000") },
        { vaultAddress: VAULT_B, assets: toWei("5000") },
      ],
    });
    expect(r).toHaveLength(0);
  });

  it("doesn't call a single position 'concentrated'", () => {
    // one vault is a starting portfolio, not a risk warning
    const r = concentrationInsights({
      ...base,
      positions: [{ vaultAddress: VAULT_A, assets: toWei("5000") }],
    });
    expect(r).toHaveLength(0);
  });
});

describe("buildInsights", () => {
  it("returns nothing for an empty portfolio", () => {
    expect(buildInsights(base)).toHaveLength(0);
  });
});
