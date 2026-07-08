import { type ReactNode } from "react";
import { ToastProvider } from "@/shared/ui";

export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
