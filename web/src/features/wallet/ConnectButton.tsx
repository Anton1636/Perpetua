import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/shared/ui";
import { AlertTriangle } from "lucide-react";

// Handles: not connected, wrong network, connected.
export function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return <div style={{ width: 140, height: 40 }} />;

        if (!connected) {
          return (
            <Button size="sm" onClick={openConnectModal}>
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button size="sm" variant="danger" onClick={openChainModal}>
              <AlertTriangle size={14} /> Wrong network
            </Button>
          );
        }

        return (
          <button
            onClick={openAccountModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: "var(--r-md)",
              background: "var(--c-surface2)",
              border: "1px solid var(--c-line)",
              color: "var(--c-cream)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "var(--f-body)",
              fontWeight: 600,
              minHeight: 40,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--c-lume)",
                boxShadow: "0 0 8px var(--c-lume)",
              }}
            />
            <span className="mono">{account.displayName}</span>
          </button>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
