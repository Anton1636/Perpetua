import { describe, it, expect } from "vitest";
import { computePnL, buildHistory } from "./pnl-math";
import { toWei } from "@/shared/lib/format";

describe("computePnL", () => {
  it("reports profit when the position grew", () => {
    const r = computePnL({
      currentValue: toWei("1100"),
      totalDeposited: toWei("1000"),
      totalWithdrawn: 0n,
    });
    expect(r.pnl).toBe(toWei("100"));
    expect(r.pnlPct).toBeCloseTo(0.1, 6);
  });

  it("counts withdrawals as realized value, not loss", () => {
    // deposited 1000, took out 400, still holding 700 -> +100 profit
    const r = computePnL({
      currentValue: toWei("700"),
      totalDeposited: toWei("1000"),
      totalWithdrawn: toWei("400"),
    });
    expect(r.pnl).toBe(toWei("100"));
  });

  it("is zero on an untouched deposit", () => {
    const r = computePnL({
      currentValue: toWei("500"),
      totalDeposited: toWei("500"),
      totalWithdrawn: 0n,
    });
    expect(r.pnl).toBe(0n);
    expect(r.pnlPct).toBe(0);
  });

  it("handles a never-funded position without dividing by zero", () => {
    const r = computePnL({ currentValue: 0n, totalDeposited: 0n, totalWithdrawn: 0n });
    expect(r.pnlPct).toBe(0);
    expect(r.costBasis).toBe(0n);
  });
});

describe("buildHistory", () => {
  it("accumulates stakes and subtracts unstakes", () => {
    const points = buildHistory([
      { kind: "STAKE", amount: toWei("1000"), timestamp: 100 },
      { kind: "STAKE", amount: toWei("500"), timestamp: 200 },
      { kind: "UNSTAKE", amount: toWei("300"), timestamp: 300 },
    ]);
    expect(points).toHaveLength(3);
    expect(points[2].invested).toBeCloseTo(1200, 6);
  });

  it("ignores harvests (they don't change invested capital)", () => {
    const points = buildHistory([
      { kind: "STAKE", amount: toWei("1000"), timestamp: 100 },
      { kind: "HARVEST", amount: toWei("50"), timestamp: 150 },
    ]);
    expect(points).toHaveLength(1);
  });
});
