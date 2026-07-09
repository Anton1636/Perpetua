import { z } from "zod";
import { toNumber } from "@/shared/lib/format";

// Validates a raw amount string from the input against a max (wallet balance or
// staked balance, both wei). Returns a typed result the modal can react to.
export function amountSchema(maxWei: bigint, min = 5) {
  const maxNum = toNumber(maxWei);
  return z
    .string()
    .min(1, "Enter an amount")
    .refine((s) => !Number.isNaN(Number(s)) && Number(s) > 0, "Enter a valid number")
    .refine((s) => Number(s) >= min, `Minimum is $${min}`)
    .refine((s) => Number(s) <= maxNum, "Exceeds available balance");
}
