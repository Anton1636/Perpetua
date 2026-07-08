// Temporary page stand-in until the real Portfolio and Security.
export function Placeholder({ name }: { name: string }) {
  return (
    <div style={{ padding: "40px 0", color: "var(--c-steel)" }}>
      <h1 style={{ fontSize: "var(--t-head)", color: "var(--c-cream)" }}>{name}</h1>
      <p style={{ marginTop: 8 }}>Coming soon in a later day.</p>
    </div>
  );
}
