"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ReviewState = { ok?: boolean; error?: string };

export async function submitReview(
  productId: string,
  slug: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const customerName = String(formData.get("name") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!customerName || !body || rating < 1 || rating > 5) {
    return { error: "Please add your name, a rating and a short review." };
  }

  await prisma.review.create({
    data: {
      productId,
      customerName,
      email,
      rating: Math.round(rating),
      title,
      body,
      status: "pending", // moderated before showing
    },
  });

  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/reviews");
  return { ok: true };
}
