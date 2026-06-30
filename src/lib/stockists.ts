import "server-only";
import { prisma } from "@/lib/prisma";

/** Active retail partners for the storefront, ordered. */
export async function getStockists() {
  return prisma.stockist.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
