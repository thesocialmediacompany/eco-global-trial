import "server-only";
import { prisma } from "@/lib/prisma";

/** Active FAQ items for /faq, ordered. */
export async function getFaqItems() {
  return prisma.faqItem.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

/** One policy page by slug. */
export async function getPolicy(slug: string) {
  return prisma.policy.findUnique({ where: { slug } });
}

/** All policy slugs (for static params / admin list). */
export async function getAllPolicies() {
  return prisma.policy.findMany({ orderBy: { sortOrder: "asc" } });
}
