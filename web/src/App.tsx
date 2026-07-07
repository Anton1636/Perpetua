import { env } from "@/shared/config/env";

// Chronograph design tokens land ..., the UI kit +
// instrument shell ..., and the Portfolio chronometer hero.
export default function App() {
  void env; // touch the validated config so it runs at startup
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#0e1113",
        color: "#ede3c2",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <h1 style={{ fontSize: 44, margin: 0, letterSpacing: "0.04em", fontWeight: 700 }}>
          PERPETUA
        </h1>
        <div style={{ width: 56, height: 2, background: "#bfe36b", margin: "16px auto" }} />
        <p style={{ color: "#9aa3a7", margin: 0 }}>Scaffold OK — Vite + React + TypeScript + FSD</p>
      </div>
    </main>
  );
}
