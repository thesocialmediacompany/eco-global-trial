/**
 * Builds a CSS override that re-themes the whole storefront from two admin-set
 * anchor colours (a primary "purple" and a secondary "green"). Returns "" when
 * neither is set, so the built-in globals.css theme is used.
 *
 * The site is built on Tailwind's `purple-50…950` / `green-50…950` scales plus
 * a few gradient stops. Rather than ask the operator for 22 shades, we take the
 * HUE + SATURATION of each anchor and rebuild the full 11-step scale over a
 * fixed lightness ramp (matched to the original palette), then regenerate the
 * gradients from the new scale. So one colour re-themes buttons, text, borders,
 * backgrounds and gradients cohesively.
 */

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function toHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
// Lightness ramp (0..1) matched to the built-in purple/green scale shape.
const L_RAMP = [0.955, 0.895, 0.79, 0.65, 0.485, 0.36, 0.28, 0.215, 0.16, 0.115, 0.075];
// Saturation envelope: gentler at the pale/dark ends so the ramp never goes neon.
const S_ENV = [0.55, 0.62, 0.72, 0.82, 0.92, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9];

/** Full 11-step scale for one Tailwind colour family from a single anchor. */
function scaleFrom(anchorHex: string, family: "purple" | "green"): Record<string, string> {
  const rgb = parseHex(anchorHex);
  if (!rgb) return {};
  const [h, s] = rgbToHsl(rgb);
  // Keep the operator's hue; clamp saturation into a tasteful, premium range.
  const baseS = Math.min(0.62, Math.max(0.16, s));
  const out: Record<string, string> = {};
  STEPS.forEach((step, i) => {
    out[`--color-${family}-${step}`] = toHex(hslToRgb(h, Math.min(1, baseS * S_ENV[i]), L_RAMP[i]));
  });
  return out;
}

export function brandThemeCss(brandPurple: string, brandGreen: string): string {
  const hasP = !!parseHex(brandPurple);
  const hasG = !!parseHex(brandGreen);
  if (!hasP && !hasG) return "";

  const vars: Record<string, string> = {};
  const purple = hasP ? scaleFrom(brandPurple, "purple") : {};
  const green = hasG ? scaleFrom(brandGreen, "green") : {};
  Object.assign(vars, purple, green);

  // Regenerate gradient stops from the new scales, falling back to the built-in
  // anchors for whichever colour wasn't customised, so gradient-purple-green
  // keeps its two-tone identity.
  const p800 = purple["--color-purple-800"] ?? "#3b1538";
  const p950 = purple["--color-purple-950"] ?? "#19081a";
  const p600 = purple["--color-purple-600"] ?? "#5e3052";
  const g800 = green["--color-green-800"] ?? "#233f18";
  const g950 = green["--color-green-950"] ?? "#0f1d0a";
  const g600 = green["--color-green-600"] ?? "#3c6326";

  Object.assign(vars, {
    "--grad-p1": p950, "--grad-p2": p800, "--grad-p3": p600,
    "--grad-g1": g950, "--grad-g2": g800, "--grad-g3": g600,
    "--grad-pg1": p950, "--grad-pg2": p800, "--grad-pg3": g800,
  });

  const body = Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";");
  return `:root{${body}}`;
}

/** Curated presets surfaced in the admin theme picker. */
export const THEME_PRESETS: { key: string; label: string; primary: string; secondary: string }[] = [
  { key: "default",  label: "Purple & Green (brand)", primary: "#5e3052", secondary: "#3c6326" },
  { key: "emerald",  label: "Emerald",                primary: "#0f766e", secondary: "#4d7c0f" },
  { key: "ocean",    label: "Ocean Blue",             primary: "#1d4ed8", secondary: "#0e7490" },
  { key: "rose",     label: "Rose",                   primary: "#9f1239", secondary: "#7c6f1f" },
  { key: "espresso", label: "Espresso",               primary: "#6b3f2b", secondary: "#5b6f2a" },
  { key: "grape",    label: "Grape & Teal",           primary: "#6d28d9", secondary: "#0d9488" },
];
