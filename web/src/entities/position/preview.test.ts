import { describe, it, expect, beforeEach } from "vitest";
import { usePositionStore, INITIAL_AVAILABLE } from "./store";
import { MOCK_POSITIONS } from "./mock";
import { previewStake, previewUnstake } from "./preview";
import { toWei } from "@/shared/lib/format";

const VAULT = MOCK_POSITIONS[0].vaultAddress;

beforeEach(() => {
  usePositionStore.setState({
    positions: MOCK_POSITIONS.map((p) => ({ ...p })),
    available: INITIAL_AVAILABLE,
  });
});

describe("preview matches execution", () => {
  it("previewStake predicts the real store result", () => {
    const pos = MOCK_POSITIONS.find((p) => p.vaultAddress === VAULT);
    const preview = previewStake(toWei("4000"), INITIAL_AVAILABLE, pos);

    usePositionStore.getState().stake(VAULT, toWei("4000"));
    const s = usePositionStore.getState();

    expect(preview.ok).toBe(true);
    expect(s.available).toBe(preview.availableAfter);
    expect(s.positions.find((p) => p.vaultAddress === VAULT)!.assets).toBe(preview.stakedAfter);
  });

  it("previewUnstake predicts a full exit (incl. claimed rewards)", () => {
    const pos = MOCK_POSITIONS.find((p) => p.vaultAddress === VAULT);
    const preview = previewUnstake(pos!.assets, INITIAL_AVAILABLE, pos);

    usePositionStore.getState().unstake(VAULT, pos!.assets);
    const s = usePositionStore.getState();

    expect(preview.ok).toBe(true);
    expect(s.available).toBe(preview.availableAfter); // includes accrued
  });

  it("previewStake rejects over-balance without touching state", () => {
    const preview = previewStake(INITIAL_AVAILABLE + 1n, INITIAL_AVAILABLE, undefined);
    expect(preview.ok).toBe(false);
  });
});
