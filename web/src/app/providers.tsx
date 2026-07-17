import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { ToastProvider } from "@/shared/ui";
import { queryClient } from "@/shared/api/query-client";
import { wagmiConfig } from "@/shared/web3/config";

// AccrualTicker + SpeedControl are retired: they animated a mock
// per-second accrual figure. Now yield lives in rising share price, realized
// by harvest — the on-chain equivalent of "watch time pass fast" is the
// Harvest button itself, not a speed toy over mock data.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#BFE36B",
            accentColorForeground: "#141A10",
            borderRadius: "medium",
          })}
        >
          <ToastProvider>{children}</ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
