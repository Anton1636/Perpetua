import { describe, it, expect, beforeEach } from "vitest";
import { usePositionStore, INITIAL_AVAILABLE } from "./store";
import { MOCK_POSITIONS } from "./mock";
import { toWei } from "@/shared/lib/format";

const VAULT = MOCK_POSITIONS[0].vaultAddress; // Ox: assets 5000, principal 5000, accrued 24.19
const NEW_VAULT = "0x2c9d47e8a1b56f3c0d8e29a7b4f61d5e8c3a9003" as const;

beforeEach(() => {
  usePositionStore.setState({
    positions: MOCK_POSITIONS.map((p) => ({ ...p })),
    available: INITIAL_AVAILABLE,
  });
});

describe("position store — money conservation", () => {
  it("stake moves money wallet -> vault and returns true", () => {
    const ok = usePositionStore.getState().stake(VAULT, toWei("4000"));
    const s = usePositionStore.getState();
    expect(ok).toBe(true);
    expect(s.available).toBe(INITIAL_AVAILABLE - toWei("4000"));
    expect(s.positions.find((p) => p.vaultAddress === VAULT)!.assets).toBe(toWei("9000"));
  });

  it("stake over available is rejected and changes nothing", () => {
    const ok = usePositionStore.getState().stake(VAULT, INITIAL_AVAILABLE + 1n);
    const s = usePositionStore.getState();
    expect(ok).toBe(false);
    expect(s.available).toBe(INITIAL_AVAILABLE);
    expect(s.positions.find((p) => p.vaultAddress === VAULT)!.assets).toBe(toWei("5000"));
  });

  it("stake opens a new position for a fresh vault", () => {
    const ok = usePositionStore.getState().stake(NEW_VAULT, toWei("1000"));
    expect(ok).toBe(true);
    const p = usePositionStore.getState().positions.find((x) => x.vaultAddress === NEW_VAULT)!;
    expect(p.assets).toBe(toWei("1000"));
    expect(p.principal).toBe(toWei("1000"));
    expect(p.accrued).toBe(0n);
  });

  it("partial unstake returns money and cuts principal proportionally", () => {
    // make assets != principal first: assets 6000, principal 5000
    usePositionStore.setState((s) => ({
      positions: s.positions.map((p) =>
        p.vaultAddress === VAULT ? { ...p, assets: toWei("6000") } : p,
      ),
    }));
    const ok = usePositionStore.getState().unstake(VAULT, toWei("3000"));
    const s = usePositionStore.getState();
    const p = s.positions.find((x) => x.vaultAddress === VAULT)!;
    expect(ok).toBe(true);
    expect(p.assets).toBe(toWei("3000"));
    expect(p.principal).toBe(toWei("2500")); // 5000 * (3000/6000)
    expect(s.available).toBe(INITIAL_AVAILABLE + toWei("3000"));
  });

  it("unstake over staked assets is rejected", () => {
    const ok = usePositionStore.getState().unstake(VAULT, toWei("5001"));
    expect(ok).toBe(false);
    expect(usePositionStore.getState().available).toBe(INITIAL_AVAILABLE);
  });

  it("full unstake removes the position AND claims accrued to the wallet", () => {
    const accrued = MOCK_POSITIONS[0].accrued;
    const ok = usePositionStore.getState().unstake(VAULT, toWei("5000"));
    const s = usePositionStore.getState();
    expect(ok).toBe(true);
    expect(s.positions.find((p) => p.vaultAddress === VAULT)).toBeUndefined();
    expect(s.available).toBe(INITIAL_AVAILABLE + toWei("5000") + accrued); // nothing vanishes
  });

  it("compoundAll moves accrued into assets and returns the total", () => {
    const before = usePositionStore.getState();
    const totalAccrued = before.positions.reduce((s, p) => s + p.accrued, 0n);
    const compounded = usePositionStore.getState().compoundAll();
    const after = usePositionStore.getState();
    expect(compounded).toBe(totalAccrued);
    expect(after.positions.every((p) => p.accrued === 0n)).toBe(true);
    const assetsBefore = before.positions.reduce((s, p) => s + p.assets, 0n);
    const assetsAfter = after.positions.reduce((s, p) => s + p.assets, 0n);
    expect(assetsAfter).toBe(assetsBefore + totalAccrued);
  });

  it("accrue adds deltas to the right positions", () => {
    usePositionStore.getState().accrue({ [VAULT]: toWei("0.001") });
    const p = usePositionStore.getState().positions.find((x) => x.vaultAddress === VAULT)!;
    expect(p.accrued).toBe(MOCK_POSITIONS[0].accrued + toWei("0.001"));
  });
});
