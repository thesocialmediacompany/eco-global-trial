import "server-only";
import { prisma } from "@/lib/prisma";

export interface PageHeroData {
  mode: "gradient" | "slider";
  gradient: string;
  animated: boolean;
  images: string[];
  autoplayMs: number;
}

/** The main pages that can have an editable cover. */
export const HERO_PAGES: { key: string; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "horeca", label: "HORECA" },
  { key: "bundles", label: "Bundles" },
  { key: "recipes", label: "Recipes" },
  { key: "about", label: "Our Story" },
  { key: "blog", label: "Blog" },
  { key: "contact", label: "Contact" },
];

function parseImages(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

/** Resolve a page's cover config, or null if none set (use the default banner). */
export async function getPageHero(pageKey: string): Promise<PageHeroData | null> {
  const row = await prisma.pageHero.findUnique({ where: { pageKey } });
  if (!row) return null;
  const images = parseImages(row.images);
  return {
    mode: row.mode === "slider" && images.length > 0 ? "slider" : "gradient",
    gradient: row.gradient || "gradient-purple-green",
    animated: row.animated,
    images,
    autoplayMs: row.autoplayMs || 5000,
  };
}
