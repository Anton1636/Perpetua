import { describe, it, expect } from "vitest";
import { previewStake, previewUnstake, previewCompound } from "./preview";
import { DomainError } from "@/shared/lib/errors";
import { toWei } from "@/shared/lib/format";
import type { Position } from "./types";

// Pure-function tests. Money-conservation itself is now guaranteed by the
// DividendVault contract (51 Foundry tests, incl. fuzz + invariants) — these
// checks cover only the arithmetic previewX() shows the user before they sign.
describe("previewStake", () => {
  it("predicts balances moving from available into the vault", () => {
    const p = previewStake(toWei("4000"), toWei("20000"), undefined);
    expect(p.ok).toBe(true);
    expect(p.availableAfter).toBe(toWei("16000"));
    expect(p.stakedAfter).toBe(toWei("4000"));
  });

  it("adds on top of an existing position", () => {
    const position: Position = {
      vaultAddress: "0x0",
      assets: toWei("1000"),
      principal: toWei("1000"),
      accrued: 0n,
    };
    const p = previewStake(toWei("500"), toWei("20000"), position);
    expect(p.stakedAfter).toBe(toWei("1500"));
  });

  it("rejects an amount over available balance", () => {
    const p = previewStake(toWei("20001"), toWei("20000"), undefined);
    expect(p.ok).toBe(false);
    expect(p.error).toBe(DomainError.InsufficientBalance);
  });
});

describe("previewUnstake", () => {
  it("returns the full position + accrued on a full exit", () => {
    const position: Position = {
      vaultAddress: "0x0",
      assets: toWei("1000"),
      principal: toWei("1000"),
      accrued: toWei("20"),
    };
    const p = previewUnstake(toWei("1000"), toWei("5000"), position);
    expect(p.ok).toBe(true);
    expect(p.availableAfter).toBe(toWei("5000") + toWei("1000") + toWei("20"));
    expect(p.stakedAfter).toBe(0n);
  });

  it("rejects withdrawing more than the position holds", () => {
    const position: Position = {
      vaultAddress: "0x0",
      assets: toWei("1000"),
      principal: toWei("1000"),
      accrued: 0n,
    };
    const p = previewUnstake(toWei("1001"), toWei("5000"), position);
    expect(p.ok).toBe(false);
    expect(p.error).toBe(DomainError.ExceedsPosition);
  });
});

describe("previewCompound", () => {
  it("moves accrued into staked", () => {
    const p = previewCompound(toWei("50"), toWei("1000"));
    expect(p.ok).toBe(true);
    expect(p.stakedAfter).toBe(toWei("1050"));
  });

  it("rejects when nothing has accrued", () => {
    const p = previewCompound(0n, toWei("1000"));
    expect(p.ok).toBe(false);
    expect(p.error).toBe(DomainError.NothingToCompound);
  });
});
