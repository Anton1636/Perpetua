// Domain error codes instead of loose strings.
// (const object instead of enum — enums are disallowed under erasableSyntaxOnly.)
export const DomainError = {
  InsufficientBalance: "InsufficientBalance",
  ExceedsPosition: "ExceedsPosition",
  InvalidAmount: "InvalidAmount",
  NothingToCompound: "NothingToCompound",
  Unknown: "Unknown",
} as const;

export type DomainError = (typeof DomainError)[keyof typeof DomainError];

export const ERROR_COPY: Record<DomainError, { title: string; desc: string }> = {
  [DomainError.InsufficientBalance]: {
    title: "Not enough available balance",
    desc: "Reduce the amount or unstake from another vault first.",
  },
  [DomainError.ExceedsPosition]: {
    title: "Amount exceeds your stake",
    desc: "You can withdraw at most what you have staked in this vault.",
  },
  [DomainError.InvalidAmount]: {
    title: "Invalid amount",
    desc: "Enter a positive number.",
  },
  [DomainError.NothingToCompound]: {
    title: "Nothing to compound",
    desc: "Rewards are still accruing — try again in a moment.",
  },
  [DomainError.Unknown]: {
    title: "Something went wrong",
    desc: "The action was not applied. Please try again.",
  },
};
