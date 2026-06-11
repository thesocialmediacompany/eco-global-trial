/**
 * Retail partners that stock Eco Global Foods products. Shown in the homepage
 * "Also available at" strip. To use an official logo, drop an image at
 * `public/stores/<slug>.(svg|png|webp|jpg)` - the section auto-detects it and
 * shows the logo instead of the styled name badge.
 */
export interface Retailer {
  name: string;
  slug: string;
  /** accent colour for the fallback name badge */
  color: string;
  url?: string;
}

export const retailers: Retailer[] = [
  { name: "Al-Fatah", slug: "al-fatah", color: "#1b7a3e" },
  { name: "Naheed", slug: "naheed", color: "#e21f26" },
  { name: "Imtiaz", slug: "imtiaz", color: "#1f5fae" },
  { name: "Rahim Store", slug: "rahim-store", color: "#c8102e" },
  { name: "D.Watson", slug: "d-watson", color: "#0a4ea2" },
  { name: "CSD", slug: "csd", color: "#e2231a" },
  { name: "Risen", slug: "risen", color: "#e2231a" },
  { name: "Jalal Sons", slug: "jalal-sons", color: "#e2231a" },
  { name: "Carrefour", slug: "carrefour", color: "#23449c" },
];
