import type { Risk } from "@/entities/vault/types";

// Single place that maps a vault's risk level to its visual language.
export const RISK_META: Record<Risk, { label: string; color: string; segments: number }> = {
  low: { label: "Low risk", color: "var(--c-lume)", segments: 1 },
  medium: { label: "Medium risk", color: "var(--c-amber)", segments: 2 },
};
