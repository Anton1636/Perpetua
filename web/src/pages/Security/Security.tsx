import { SecurityChecks } from "@/features/security/SecurityChecks";

export function Security() {
  return (
    <div>
      <div style={{ margin: "10px 0 6px" }}>
        <h1
          style={{
            fontFamily: "var(--f-display)",
            fontWeight: 700,
            fontSize: "clamp(26px,4vw,34px)",
            letterSpacing: "-0.01em",
            color: "var(--c-cream)",
          }}
        >
          Security
        </h1>
        <p style={{ color: "var(--c-steel)", fontSize: 14, marginTop: 5, maxWidth: 560 }}>
          How Perpetua protects your funds. Every stake is previewed before it runs, vaults are
          non-custodial, and contracts are verified on-chain.
        </p>
      </div>
      <div style={{ marginTop: 18 }}>
        <SecurityChecks />
      </div>
    </div>
  );
}
