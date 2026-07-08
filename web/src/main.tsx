import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/shared/config/env"; // validate env at startup (throws early if invalid)
import "@/shared/styles/fonts"; // self-hosted fonts (no external requests)
import "@/shared/styles/global.css";
import { buildTokenCss } from "@/shared/lib/tokens-to-css";
import App from "./App.tsx";

// Inject the design tokens as CSS variables before first paint, so global.css
// and every component can read them via var(--...).
const tokenStyle = document.createElement("style");
tokenStyle.id = "chronograph-tokens";
tokenStyle.textContent = buildTokenCss();
document.head.appendChild(tokenStyle);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
