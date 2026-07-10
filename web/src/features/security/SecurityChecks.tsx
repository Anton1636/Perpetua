import { ShieldCheck, Lock, Eye, FileCheck } from "lucide-react";
import { Card } from "@/shared/ui";

// Static trust surface for now; on Day 21 these become live checks (contract
// verified on Etherscan, approvals scan, simulation status).
const CHECKS = [
  {
    icon: ShieldCheck,
    title: "Non-custodial",
    desc: "Funds stay in your wallet until you stake. Withdrawals are permissionless.",
  },
  {
    icon: Lock,
    title: "Reentrancy-guarded vaults",
    desc: "ERC-4626 vaults use checks-effects-interactions + guards (audited on Day 15).",
  },
  {
    icon: FileCheck,
    title: "Verified contracts",
    desc: "Every deployed contract is source-verified on Etherscan (Sepolia).",
  },
  {
    icon: Eye,
    title: "Simulate before signing",
    desc: "Each action is previewed locally so you see the outcome before committing.",
  },
];

export function SecurityChecks() {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {CHECKS.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.title} elevation={2} style={{ padding: 18, display: "flex", gap: 13 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-md)",
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--c-lumeDim)",
              }}
            >
              <Icon size={19} color="var(--c-lume)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
              <div style={{ color: "var(--c-steel)", fontSize: 12.5, marginTop: 3 }}>{c.desc}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
