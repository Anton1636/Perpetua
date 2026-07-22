import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, HelpCircle, Loader2, ExternalLink } from "lucide-react";
import { Card } from "@/shared/ui";
import { checkVerified, type VerifyStatus } from "@/shared/web3/etherscan";
import { CONTRACTS, VAULTS } from "@/shared/web3/addresses";

const TRACKED = [
  { label: "Vault Factory", address: CONTRACTS.factory },
  { label: "Zap Router", address: CONTRACTS.zapRouter },
  { label: "Keeper", address: CONTRACTS.keeper },
  { label: `${VAULTS[0].symbol} Vault`, address: VAULTS[0].vault },
];

export function VerificationBadges() {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      }}
    >
      {TRACKED.map((c) => (
        <VerifyRow key={c.address} label={c.label} address={c.address} />
      ))}
    </div>
  );
}

// Visual + copy for every state. "unavailable" is deliberately distinct from
// "unverified": a failed API call must never look like a failed verification.
function statusView(status: VerifyStatus | undefined, isLoading: boolean) {
  if (isLoading) {
    return {
      icon: <Loader2 size={18} className="spin" color="var(--c-steel)" />,
      text: "Checking…",
      color: "var(--c-steel)",
    };
  }
  if (status === "verified") {
    return {
      icon: <CheckCircle2 size={18} color="var(--c-lume)" />,
      text: "Verified on Etherscan",
      color: "var(--c-lume)",
    };
  }
  if (status === "unverified") {
    return {
      icon: <XCircle size={18} color="var(--c-red)" />,
      text: "Source not verified",
      color: "var(--c-red)",
    };
  }
  return {
    icon: <HelpCircle size={18} color="var(--c-steel)" />,
    text: "Status unavailable — check manually",
    color: "var(--c-steel)",
  };
}

function VerifyRow({ label, address }: { label: string; address: string }) {
  const { data: status, isLoading } = useQuery({
    queryKey: ["verify", address],
    queryFn: () => checkVerified(address),
    staleTime: Infinity, // a contract's verification state never changes
    retry: false, // don't hammer the API when the key is missing or rate-limited
  });

  const view = statusView(status, isLoading);

  return (
    <Card elevation={2} style={{ padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
      {view.icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: view.color, marginTop: 1 }}>{view.text}</div>
      </div>
      <a
        href={`https://sepolia.etherscan.io/address/${address}#code`}
        target="_blank"
        rel="noreferrer"
        title="View source on Etherscan"
        style={{ color: "#9FD9FF", display: "flex" }}
      >
        <ExternalLink size={14} />
      </a>
    </Card>
  );
}
