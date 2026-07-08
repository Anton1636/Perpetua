// Chronograph design tokens — the single source of truth for the whole UI.
// Aesthetic: a precision instrument — charcoal case, cream dial text, lume-green
// accent, red seconds-hand accent for danger.
export const tokens = {
  color: {
    // instrument case / surfaces (elevation 0 -> 3)
    bg: "#0E1113",
    surface1: "#14181B",
    surface2: "#1B2125",
    surface3: "#232B30",
    line: "rgba(237,227,194,0.10)",
    line2: "rgba(237,227,194,0.18)",
    // dial ink / text
    cream: "#EDE3C2",
    steel: "#9AA3A7",
    faint: "#5F686B",
    // accents
    lume: "#BFE36B",
    lumeDim: "rgba(191,227,107,0.14)",
    red: "#FF4D3D",
    redDim: "rgba(255,77,61,0.14)",
    amber: "#E7A33E",
    amberDim: "rgba(231,163,62,0.14)",
  },
  space: { 1: "8px", 2: "12px", 3: "16px", 4: "24px", 5: "32px", 6: "48px", 7: "64px" },
  radius: { sm: "8px", md: "12px", lg: "16px", xl: "22px", pill: "999px" },
  text: { cap: "12px", body: "14px", bodyLg: "16px", section: "20px", head: "28px", hero: "40px" },
  font: {
    display: "'Saira Semi Condensed', system-ui, sans-serif",
    body: "'Spline Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace",
  },
  motion: {
    fast: "120ms",
    base: "200ms",
    slow: "360ms",
    ease: "cubic-bezier(0.4,0,0.2,1)",
    out: "cubic-bezier(0.16,1,0.3,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
  },
  // instrument depth layers, as box-shadow strings
  elevation: {
    1: "0 1px 2px rgba(0,0,0,0.30)",
    2: "0 2px 10px rgba(0,0,0,0.35)",
    3: "0 14px 36px rgba(0,0,0,0.46)",
    4: "0 28px 70px rgba(0,0,0,0.60)",
  },
} as const;

export type Tokens = typeof tokens;
