import { motion } from "framer-motion";

// Day 2 smoke test: proves design tokens (CSS variables) + self-hosted fonts +
// framer-motion all work. The real Chronograph UI (kit + instrument shell)
export default function App() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "var(--s-4)",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="mono"
          style={{ color: "var(--c-steel)", fontSize: "var(--t-cap)", letterSpacing: "0.25em" }}
        >
          CHRONOGRAPH · DESIGN TOKENS
        </div>
        <h1 style={{ fontSize: "var(--t-hero)", letterSpacing: "0.04em", marginTop: "var(--s-2)" }}>
          PERPETUA
        </h1>
        <div
          style={{ width: 56, height: 2, background: "var(--c-lume)", margin: "var(--s-3) auto" }}
        />
        <p style={{ color: "var(--c-steel)" }}>Tokens, fonts and motion wired up.</p>
      </motion.div>
    </main>
  );
}
