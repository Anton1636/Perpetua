import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/shared/ui";
import { queryClient } from "@/shared/api/query-client";
import { AccrualTicker } from "@/features/accrual/AccrualTicker";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AccrualTicker />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
