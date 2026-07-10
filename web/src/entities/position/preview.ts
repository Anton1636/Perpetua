import type { Position } from "./types";
import { DomainError } from "@/shared/lib/errors";

// Pure "what will happen" functions — one per action. The modal shows these
// before the user confirms; tests assert apply(preview) == execute();
export interface PreviewResult {
  ok: boolean;
  error?: DomainError;
  availableAfter: bigint;
  stakedAfter: bigint; // assets in the targeted vault after
  fee: bigint; // performance fee taken
}

export function previewStake(
  amount: bigint,
  available: bigint,
  position: Position | undefined,
): PreviewResult {
  const stakedNow = position?.assets ?? 0n;
  if (amount <= 0n) return fail(available, stakedNow, DomainError.InvalidAmount);
  if (amount > available) return fail(available, stakedNow, DomainError.InsufficientBalance);
  return { ok: true, availableAfter: available - amount, stakedAfter: stakedNow + amount, fee: 0n };
}

export function previewUnstake(
  amount: bigint,
  available: bigint,
  position: Position | undefined,
): PreviewResult {
  const stakedNow = position?.assets ?? 0n;
  if (amount <= 0n) return fail(available, stakedNow, DomainError.InvalidAmount);
  if (amount > stakedNow) return fail(available, stakedNow, DomainError.ExceedsPosition);
  const claimed = amount === stakedNow ? (position?.accrued ?? 0n) : 0n;
  return {
    ok: true,
    availableAfter: available + amount + claimed,
    stakedAfter: stakedNow - amount,
    fee: 0n,
  };
}

export function previewCompound(totalAccrued: bigint, staked: bigint): PreviewResult {
  if (totalAccrued <= 0n) return fail(0n, staked, DomainError.NothingToCompound);
  return { ok: true, availableAfter: 0n, stakedAfter: staked + totalAccrued, fee: 0n };
}

function fail(available: bigint, staked: bigint, error: DomainError): PreviewResult {
  return { ok: false, error, availableAfter: available, stakedAfter: staked, fee: 0n };
}
