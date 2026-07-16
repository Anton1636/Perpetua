import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { http, fallback } from "wagmi";
import { env } from "@/shared/config/env";

// wagmi + RainbowKit config. Fallback transport: try the Alchemy RPC first, then
// public Sepolia endpoints — so a single RPC outage doesn't break the app.
export const wagmiConfig = getDefaultConfig({
  appName: "Perpetua",
  projectId: env.VITE_WALLETCONNECT_PROJECT_ID ?? "PLACEHOLDER_PROJECT_ID",
  chains: [sepolia],
  transports: {
    [sepolia.id]: fallback([
      ...(env.VITE_SEPOLIA_RPC_URL ? [http(env.VITE_SEPOLIA_RPC_URL)] : []),
      http("https://ethereum-sepolia-rpc.publicnode.com"),
      http("https://rpc.sepolia.org"),
    ]),
  },
  ssr: false,
});
