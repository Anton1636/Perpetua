import { type ButtonHTMLAttributes, forwardRef } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

// Base button. One component, variants via props — never a new button style
// per screen. Forwards ref so Radix can compose it (e.g. as a Dialog trigger).
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    const classes = [styles.btn, styles[variant], size === "sm" && styles.sm, className]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = "Button";
