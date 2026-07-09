import type { Position } from "./types";
import { toWei } from "@/shared/lib/format";

// Mock positions in chain shape. Replaced by a contract read soon.
export const MOCK_POSITIONS: Position[] = [
  {
    vaultAddress: "0x0000000000000000000000000000000000000001",
    shares: toWei("5000"),
    principal: toWei("5000"),
    accrued: toWei("24.19"),
  },
  {
    vaultAddress: "0x0000000000000000000000000000000000000004",
    shares: toWei("3000"),
    principal: toWei("3000"),
    accrued: toWei("11.02"),
  },
  {
    vaultAddress: "0x0000000000000000000000000000000000000002",
    shares: toWei("2000"),
    principal: toWei("2000"),
    accrued: toWei("8.77"),
  },
];
