import { tokens } from "@/shared/config/tokens";

// Flatten the token tree into a ":root { --group-key: value; ... }" string.
// Prefixes: c=color, s=space, r=radius, t=text, m=motion, e=elevation, f=font.
function entries(obj: object): [string, string][] {
  return Object.entries(obj) as [string, string][];
}

export function buildTokenCss(): string {
  const decls: string[] = [];
  const add = (prefix: string, group: object) =>
    entries(group).forEach(([key, value]) => decls.push(`--${prefix}-${key}: ${value};`));

  add("c", tokens.color);
  add("s", tokens.space);
  add("r", tokens.radius);
  add("t", tokens.text);
  add("m", tokens.motion);
  add("e", tokens.elevation);
  decls.push(`--f-display: ${tokens.font.display};`);
  decls.push(`--f-body: ${tokens.font.body};`);
  decls.push(`--f-mono: ${tokens.font.mono};`);

  return `:root{${decls.join("")}}`;
}
