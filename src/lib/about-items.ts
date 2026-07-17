import "server-only";
import { prisma } from "@/lib/prisma";

export interface AboutItemRow {
  id: string;
  grid: string;
  icon: string;
  year: string;
  title: string;
  body: string;
  sortOrder: number;
}

/**
 * Active About page items grouped by grid, in sort order. DB-safe: returns
 * empty groups if the query fails, and the page hides any empty section rather
 * than rendering a broken heading.
 */
export async function getAboutItems(): Promise<Record<string, AboutItemRow[]>> {
  try {
    const rows = await prisma.aboutItem.findMany({
      where: { active: true },
      orderBy: [{ grid: "asc" }, { sortOrder: "asc" }],
    });
    const out: Record<string, AboutItemRow[]> = {};
    for (const r of rows) (out[r.grid] ??= []).push(r);
    return out;
  } catch {
    return {};
  }
}
