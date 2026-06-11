import "server-only";
import { prisma } from "@/lib/prisma";

export async function getApprovedReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, status: "approved" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Aggregate rating from APPROVED reviews only. There is no fabricated fallback:
 * if a product has no approved reviews, it has no rating. This keeps the rating
 * shown on the page consistent with the reviews actually listed.
 */
export async function getReviewStats(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "approved" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const count = agg._count._all;
  if (count === 0) return { average: null as number | null, count: 0, hasReviews: false };
  return {
    average: Math.round((agg._avg.rating ?? 0) * 10) / 10,
    count,
    hasReviews: true,
  };
}

/**
 * Re-sync a product's denormalised rating + reviewCount from its approved
 * reviews. Call after any review is created (and approved), approved,
 * unapproved or deleted so product cards never disagree with the reviews list.
 */
export async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "approved" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._count._all ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : null,
      reviewCount: agg._count._all,
    },
  });
}
