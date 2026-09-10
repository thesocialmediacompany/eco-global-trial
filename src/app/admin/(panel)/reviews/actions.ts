"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recomputeProductRating } from "@/lib/reviews";

async function syncAndRevalidate(reviewId: string, productId?: string) {
  if (productId) {
    await recomputeProductRating(productId);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });
    if (product) revalidatePath(`/product/${product.slug}`);
  }
  revalidatePath("/admin/reviews");
}

export async function approveReview(id: string) {
  const r = await prisma.review.update({
    where: { id },
    data: { status: "approved" },
    select: { productId: true },
  });
  await syncAndRevalidate(id, r.productId);
}

export async function unapproveReview(id: string) {
  const r = await prisma.review.update({
    where: { id },
    data: { status: "pending" },
    select: { productId: true },
  });
  await syncAndRevalidate(id, r.productId);
}

export async function setReviewRating(id: string, rating: number) {
  const r = Math.round(rating);
  if (r < 1 || r > 5) return; // ignore out-of-range values
  const rev = await prisma.review.update({
    where: { id },
    data: { rating: r },
    select: { productId: true },
  });
  // Recompute the product's average only matters for approved reviews, but
  // syncAndRevalidate handles both and always refreshes the two pages.
  await syncAndRevalidate(id, rev.productId);
}

export async function deleteReview(id: string) {
  const r = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
  await prisma.review.delete({ where: { id } });
  await syncAndRevalidate(id, r?.productId);
}
