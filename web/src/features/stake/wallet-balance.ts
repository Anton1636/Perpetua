import { toWei } from "@/shared/lib/format";

// Mock wallet balances per vault symbol (wei). AAPLx=0 shows the zero-balance
// path. Replaced by on-chain token balances on Day 15.
export const WALLET_BALANCE: Record<string, bigint> = {
  Ox: toWei("8000"),
  KOx: toWei("4000"),
  JNJx: toWei("2500"),
  SPYx: toWei("10000"),
  AAPLx: toWei("0"),
};
