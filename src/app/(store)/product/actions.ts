"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export type ReviewState = { ok?: boolean; error?: string };

// Length caps — generous for genuine reviews, tight enough to stop payload spam.
const MAX = { name: 60, email: 120, title: 120, body: 2000 };
const MIN_BODY = 10;
// Per-IP submission cap. Deliberately high because Pakistani mobile networks
// use carrier-grade NAT (many real users behind one IP) — this only catches
// rapid-fire flooding, not a household sharing a connection.
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

/** Truncated SHA-256 of the caller's IP — a stable key with no stored PII. */
async function submitterIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function submitReview(
  productId: string,
  slug: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  // Honeypot: a hidden field no human sees. If it's filled, a bot did it —
  // pretend success so the bot moves on, but store nothing.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true };
  }

  const customerName = String(formData.get("name") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!customerName || !body || rating < 1 || rating > 5) {
    return { error: "Please add your name, a rating and a short review." };
  }
  if (body.length < MIN_BODY) {
    return { error: "Please write a little more — at least a sentence." };
  }
  if (
    customerName.length > MAX.name ||
    email.length > MAX.email ||
    title.length > MAX.title ||
    body.length > MAX.body
  ) {
    return { error: "That review is too long. Please shorten it and try again." };
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Please enter a valid email, or leave it blank." };
  }

  // Rate limit by IP so a bot can't flood the moderation queue.
  const ipHash = await submitterIpHash();
  const recent = await prisma.review.count({
    where: { ipHash, createdAt: { gte: new Date(Date.now() - RATE_LIMIT.windowMs) } },
  });
  if (recent >= RATE_LIMIT.max) {
    return { error: "You've submitted several reviews just now — please try again in a few minutes." };
  }

  await prisma.review.create({
    data: {
      productId,
      customerName,
      email,
      rating: Math.round(rating),
      title,
      body,
      ipHash,
      status: "pending", // moderated before showing
    },
  });

  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/reviews");
  return { ok: true };
}
