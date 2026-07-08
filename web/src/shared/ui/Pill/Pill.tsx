import { type HTMLAttributes } from "react";
import styles from "./Pill.module.css";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "lume" | "red" | "amber" | "neutral";
}

export function Pill({ tone = "neutral", className, ...props }: PillProps) {
  return (
    <span className={[styles.pill, styles[tone], className].filter(Boolean).join(" ")} {...props} />
  );
}
