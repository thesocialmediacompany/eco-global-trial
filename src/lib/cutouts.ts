import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Transparent (background-removed) product cutouts live in /public/products as
 * `<slug>.png`. They're generated offline; this returns the public path when a
 * cutout exists for a product, so the floating hero/slider cards can show a
 * clean pack instead of the catalogue photo (which has a baked-in background).
 */
function available(): Set<string> {
  try {
    const dir = path.join(process.cwd(), "public", "cutouts");
    return new Set(
      fs
        .readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith(".png"))
        .map((f) => f.replace(/\.png$/i, "")),
    );
  } catch {
    return new Set();
  }
}

export function cutoutFor(slug: string): string | undefined {
  return available().has(slug) ? `/cutouts/${slug}.png` : undefined;
}

/**
 * Returns `/covers/<filename>` only if that file exists in public/covers, else
 * undefined — so a hero poster can opt into a mobile-specific banner image
 * without breaking before the file has been added.
 */
export function coverImage(filename: string): string | undefined {
  try {
    const p = path.join(process.cwd(), "public", "covers", filename);
    return fs.existsSync(p) ? `/covers/${filename}` : undefined;
  } catch {
    return undefined;
  }
}
