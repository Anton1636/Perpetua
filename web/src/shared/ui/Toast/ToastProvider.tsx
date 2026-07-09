import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import styles from "./Toast.module.css";

type ToastKind = "success" | "warning" | "error" | "pending";
interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  desc?: string;
}

const ICON = {
  success: <CheckCircle2 size={18} color="var(--c-lume)" />,
  warning: <AlertTriangle size={18} color="var(--c-amber)" />,
  error: <XCircle size={18} color="var(--c-red)" />,
  pending: <Loader2 size={18} color="var(--c-lume)" className="spin" />,
};

const ToastContext = createContext<(t: Omit<ToastItem, "id">) => void>(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    setItems((prev) => [...prev, { ...t, id: Date.now() + Math.random() }].slice(-4));
  }, []);

  return (
    <ToastContext.Provider value={push}>
      <ToastPrimitive.Provider swipeDirection="right" duration={3600}>
        {children}
        {items.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={styles.toast}
            onOpenChange={(open: boolean) => {
              if (!open) setItems((prev) => prev.filter((i) => i.id !== t.id));
            }}
          >
            <span className={styles.icon}>{ICON[t.kind]}</span>
            <div>
              <ToastPrimitive.Title className={styles.title}>{t.title}</ToastPrimitive.Title>
              {t.desc && (
                <ToastPrimitive.Description className={styles.desc}>
                  {t.desc}
                </ToastPrimitive.Description>
              )}
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className={styles.viewport} />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
