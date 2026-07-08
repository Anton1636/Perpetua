import { type HTMLAttributes } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 1 | 2 | 3;
}

export function Card({ elevation = 2, className, ...props }: CardProps) {
  const classes = [styles.card, styles[`e${elevation}`], className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}
