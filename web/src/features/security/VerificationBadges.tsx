import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, HelpCircle, ExternalLink } from "lucide-react";
import { Card } from "@/shared/ui";
import { checkVerified } from "@/shared/web3/etherscan";
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

function VerifyRow({ label, address }: { label: string; address: string }) {
  const { data: status } = useQuery({
    queryKey: ["verify", address],
    queryFn: () => checkVerified(address),
    staleTime: Infinity, // verification doesn't change
  });

  return (
    <Card elevation={2} style={{ padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
      {status === "verified" ? (
        <CheckCircle2 size={18} color="var(--c-lume)" />
      ) : (
        <HelpCircle size={18} color="var(--c-steel)" />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--c-steel)" }}>
          {status === "verified"
            ? "Verified on Etherscan"
            : status === "unverified"
              ? "Not verified"
              : "Checking…"}
        </div>
      </div>
      <a
        href={`https://sepolia.etherscan.io/address/${address}#code`}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#9FD9FF", display: "flex" }}
      >
        <ExternalLink size={14} />
      </a>
    </Card>
  );
}
