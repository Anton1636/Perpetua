import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { ToastProvider } from "@/shared/ui";
import { queryClient } from "@/shared/api/query-client";
import { wagmiConfig } from "@/shared/web3/config";
import { AccrualTicker } from "@/features/accrual/AccrualTicker";
import { SpeedControl } from "@/features/dev/SpeedControl";

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
          <ToastProvider>
            <AccrualTicker />
            <SpeedControl />
            {children}
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
