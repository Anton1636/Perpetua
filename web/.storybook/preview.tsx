import type { Preview } from "@storybook/react-vite";
import "../src/shared/styles/fonts";
import "../src/shared/styles/global.css";
import { buildTokenCss } from "../src/shared/lib/tokens-to-css";

// Inject Chronograph design tokens as CSS variables so every story is styled
// exactly like the app (Storybook renders components outside main.tsx).
if (typeof document !== "undefined" && !document.getElementById("chronograph-tokens")) {
  const style = document.createElement("style");
  style.id = "chronograph-tokens";
  style.textContent = buildTokenCss();
  document.head.appendChild(style);
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "chronograph",
      values: [{ name: "chronograph", value: "#0E1113" }],
    },
  },
};

export default preview;
