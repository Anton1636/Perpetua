import { SecurityChecks } from "@/features/security/SecurityChecks";
import { ApprovalScanner } from "@/features/security/ApprovalScanner";
import { VerificationBadges } from "@/features/security/VerificationBadges";

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ margin: "26px 0 12px" }}>
      <h2
        style={{
          fontFamily: "var(--f-display)",
          fontWeight: 700,
          fontSize: 18,
          color: "var(--c-cream)",
        }}
      >
        {title}
      </h2>
      <p style={{ color: "var(--c-steel)", fontSize: 13, marginTop: 3 }}>{desc}</p>
    </div>
  );
}

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
          How Perpetua protects your funds — with live checks, not just promises.
        </p>
      </div>

      <SecurityChecks />

      <SectionTitle
        title="Token approvals"
        desc="Contracts you've allowed to move your tokens. Revoke any you no longer use."
      />
      <ApprovalScanner />

      <SectionTitle
        title="Contract verification"
        desc="Every deployed contract's source is public and verified on Etherscan."
      />
      <VerificationBadges />
    </div>
  );
}
