import type { Vault } from "./types";
import { toWei } from "@/shared/lib/format";

// Mock vaults in chain shape. Addresses are realistic 20-byte hex (lowercase)
// so viem's address handling won't reject them ...
export const MOCK_VAULTS: Vault[] = [
  {
    address: "0x51a4c8e2b7d94f3a6c0e8b12d5f7a9c4e6b8d001",
    symbol: "Ox",
    name: "Realty Income",
    dividendPct: 5.5,
    stakingPct: 2.8,
    risk: "medium",
    tag: "Monthly payer",
    pricePerShare: toWei("58.20"),
    tvl: toWei("4200000"),
  },
  {
    address: "0x7be31f6a9d24c8e5b0a7f39d1c6e84b2a5d9f002",
    symbol: "KOx",
    name: "Coca-Cola",
    dividendPct: 3.1,
    stakingPct: 3.2,
    risk: "low",
    tag: "Dividend King",
    pricePerShare: toWei("62.40"),
    tvl: toWei("6800000"),
  },
  {
    address: "0x2c9d47e8a1b56f3c0d8e29a7b4f61d5e8c3a9003",
    symbol: "JNJx",
    name: "Johnson & Johnson",
    dividendPct: 3.0,
    stakingPct: 3.1,
    risk: "low",
    tag: "Dividend King",
    pricePerShare: toWei("152.90"),
    tvl: toWei("5100000"),
  },
  {
    address: "0x8f5a2d9c4b7e13a6d0c58f2b9e47a1c3d6b0e004",
    symbol: "SPYx",
    name: "S&P 500 ETF",
    dividendPct: 1.3,
    stakingPct: 3.2,
    risk: "low",
    tag: "Diversified",
    pricePerShare: toWei("596.20"),
    tvl: toWei("12600000"),
  },
  {
    address: "0x3e7b9c1f5a8d24e6b0f3a7c9d215e8b4f6a1c005",
    symbol: "AAPLx",
    name: "Apple",
    dividendPct: 0.5,
    stakingPct: 4.4,
    risk: "medium",
    tag: "Growth",
    pricePerShare: toWei("228.40"),
    tvl: toWei("9300000"),
  },
];
