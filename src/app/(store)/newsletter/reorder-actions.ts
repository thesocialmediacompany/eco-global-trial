"use server";

import { prisma } from "@/lib/prisma";

export type ReorderState = { ok?: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Opt a customer into a reorder reminder for a product (Subscribe & Save). */
export async function subscribeReorder(
  _prev: ReorderState,
  formData: FormData,
): Promise<ReorderState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const productTitle = String(formData.get("productTitle") ?? "").trim();
  const frequencyWeeks = Math.max(1, Math.min(26, Number(formData.get("frequencyWeeks")) || 4));
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };

  await prisma.reorderReminder.upsert({
    where: { email_productSlug: { email, productSlug } },
    update: { frequencyWeeks, productTitle, active: true },
    create: { email, productSlug, productTitle, frequencyWeeks },
  });

  return { ok: true };
}
