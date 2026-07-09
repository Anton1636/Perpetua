import { describe, it, expect } from "vitest";
import { baseYield, apy, sharesToAssets, assetsToShares, projection } from "./vault-math";

describe("vault-math", () => {
  it("baseYield sums dividend + staking as a fraction", () => {
    expect(baseYield(5.5, 2.8)).toBeCloseTo(0.083, 6);
  });

  it("apy compounds daily and beats the nominal yield", () => {
    const nominal = 0.083;
    expect(apy(nominal)).toBeGreaterThan(nominal);
    expect(apy(nominal)).toBeCloseTo(0.0865, 3);
  });

  it("shares<->assets is 1:1 on an empty vault", () => {
    expect(sharesToAssets(100n, 0n, 0n)).toBe(100n);
    expect(assetsToShares(100n, 0n, 0n)).toBe(100n);
  });

  it("shares convert against the exchange rate", () => {
    // vault holds 1200 assets for 1000 shares -> 1.2 assets per share
    expect(sharesToAssets(1000n, 1200n, 1000n)).toBe(1200n);
    expect(assetsToShares(1200n, 1200n, 1000n)).toBe(1000n);
  });

  it("assets->shares->assets round-trips", () => {
    const ta = 1200n;
    const ts = 1000n;
    const shares = assetsToShares(600n, ta, ts);
    expect(sharesToAssets(shares, ta, ts)).toBe(600n);
  });

  it("projection: DRIP always >= simple, and starts at principal", () => {
    const p = projection(5000, 10, 0.0865, 0.083);
    expect(p[0].compounded).toBe(5000);
    expect(p[0].simple).toBe(5000);
    const last = p[p.length - 1];
    expect(last.compounded).toBeGreaterThan(last.simple);
  });
});
