import type { Position } from "./types";
import { toWei } from "@/shared/lib/format";

// Mock positions (assets-based). Addresses must match entities/vault/mock.ts.
export const MOCK_POSITIONS: Position[] = [
  {
    vaultAddress: "0x51a4c8e2b7d94f3a6c0e8b12d5f7a9c4e6b8d001",
    assets: toWei("5000"),
    principal: toWei("5000"),
    accrued: toWei("24.19"),
  },
  {
    vaultAddress: "0x8f5a2d9c4b7e13a6d0c58f2b9e47a1c3d6b0e004",
    assets: toWei("3000"),
    principal: toWei("3000"),
    accrued: toWei("11.02"),
  },
  {
    vaultAddress: "0x7be31f6a9d24c8e5b0a7f39d1c6e84b2a5d9f002",
    assets: toWei("2000"),
    principal: toWei("2000"),
    accrued: toWei("8.77"),
  },
];
