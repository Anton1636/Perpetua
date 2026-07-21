import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Card, Button, useToast } from "@/shared/ui";
import { mockEquityTokenAbi } from "@/shared/web3/generated";
import { formatUsd } from "@/shared/lib/format";
import { useApprovals, type Approval } from "./useApprovals";
import { useState } from "react";

export function ApprovalScanner() {
  const { isConnected } = useAccount();
  const { data: approvals, isLoading } = useApprovals();

  if (!isConnected) {
    return (
      <Card elevation={2} style={{ padding: 24, textAlign: "center", color: "var(--c-steel)" }}>
        Connect your wallet to scan token approvals.
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card
        elevation={2}
        style={{
          padding: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--c-steel)",
        }}
      >
        <Loader2 size={16} className="spin" /> Scanning approvals…
      </Card>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <Card elevation={2} style={{ padding: 24, textAlign: "center" }}>
        <ShieldAlert size={22} color="var(--c-lume)" style={{ marginBottom: 8 }} />
        <div style={{ color: "var(--c-cream)", fontWeight: 600 }}>No active approvals</div>
        <div style={{ color: "var(--c-steel)", fontSize: 13, marginTop: 4 }}>
          You haven’t granted any token spending permissions.
        </div>
      </Card>
    );
  }

  return (
    <Card elevation={2} style={{ padding: 0, overflow: "hidden" }}>
      {approvals.map((a) => (
        <ApprovalRow key={`${a.token}-${a.spender}`} approval={a} />
      ))}
    </Card>
  );
}

function ApprovalRow({ approval }: { approval: Approval }) {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [revoking, setRevoking] = useState(false);

  const revoke = async () => {
    if (!publicClient) return;
    setRevoking(true);
    try {
      toast({
        kind: "pending",
        title: "Revoking approval",
        desc: `${approval.symbol} → ${approval.spenderLabel}`,
      });
      const hash = await writeContractAsync({
        address: approval.token,
        abi: mockEquityTokenAbi,
        functionName: "approve",
        args: [approval.spender, 0n], // setting allowance to 0 = revoke
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
      toast({ kind: "success", title: "Approval revoked" });
    } catch {
      toast({ kind: "error", title: "Revoke failed or rejected" });
    } finally {
      setRevoking(false);
    }
  };

  const isUnlimited = approval.allowance > 10n ** 30n;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        borderTop: "1px solid var(--c-line)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          {approval.symbol}{" "}
          <span style={{ color: "var(--c-faint)", fontWeight: 400 }}>
            → {approval.spenderLabel}
          </span>
        </div>
        <div
          className="mono"
          style={{
            fontSize: 12,
            color: isUnlimited ? "var(--c-amber)" : "var(--c-steel)",
            marginTop: 2,
          }}
        >
          {isUnlimited ? "Unlimited allowance" : `Allowance: ${formatUsd(approval.allowance)}`}
        </div>
      </div>
      <Button variant="danger" size="sm" onClick={revoke} disabled={revoking}>
        {revoking ? "Revoking…" : "Revoke"}
      </Button>
    </div>
  );
}
