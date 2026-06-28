/**
 * Builds a CSS override for the site's brand gradients from two anchor colours
 * (purple + green) set in admin Settings. Returns "" when colours aren't set,
 * so the built-in theme (globals.css defaults) is used.
 */

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function toHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

/** Mix a colour toward black (amt>0 darkens) or white (amt<0 lightens), amt in -1..1. */
function shade(rgb: [number, number, number], amt: number): [number, number, number] {
  const target = amt >= 0 ? 0 : 255;
  const a = Math.abs(amt);
  return [
    rgb[0] + (target - rgb[0]) * a,
    rgb[1] + (target - rgb[1]) * a,
    rgb[2] + (target - rgb[2]) * a,
  ];
}

export function brandThemeCss(brandPurple: string, brandGreen: string): string {
  const p = parseHex(brandPurple);
  const g = parseHex(brandGreen);
  if (!p && !g) return "";

  // fall back to the built-in anchors when only one colour is provided
  const P = p ?? parseHex("#3b1538")!;
  const G = g ?? parseHex("#233f18")!;

  const vars: Record<string, string> = {
    "--grad-p1": toHex(shade(P, 0.55)),
    "--grad-p2": toHex(P),
    "--grad-p3": toHex(shade(P, -0.22)),
    "--grad-g1": toHex(shade(G, 0.45)),
    "--grad-g2": toHex(G),
    "--grad-g3": toHex(shade(G, -0.25)),
    "--grad-pg1": toHex(shade(P, 0.55)),
    "--grad-pg2": toHex(P),
    "--grad-pg3": toHex(G),
  };

  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `:root{${body}}`;
}
