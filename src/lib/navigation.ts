import "server-only";
import { prisma } from "@/lib/prisma";

export type NavLocation = "header" | "footer_shop" | "footer_company";

/** Enabled links for a given menu location, ordered. */
export async function getNavLinks(location: NavLocation) {
  return prisma.navLink.findMany({
    where: { location, enabled: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

/** All links (incl. disabled) grouped by location, for the admin editor. */
export async function getAllNavLinks() {
  const all = await prisma.navLink.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return {
    header: all.filter((l) => l.location === "header"),
    footer_shop: all.filter((l) => l.location === "footer_shop"),
    footer_company: all.filter((l) => l.location === "footer_company"),
  };
}
