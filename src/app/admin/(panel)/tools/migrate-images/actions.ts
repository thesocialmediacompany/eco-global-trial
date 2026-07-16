"use server";

import { requireOwner } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { migrateUrl, isShopifyUrl } from "@/lib/image-migrate";
import { s3Configured } from "@/lib/storage";

/** How many products to convert per call. Kept small so each request finishes
 * well within the serverless timeout; the client loops until done. */
const BATCH = 3;

const shopifyWhere = {
  OR: [
    { imageUrl: { contains: "cdn.shopify.com" } },
    { images: { contains: "cdn.shopify.com" } },
  ],
};

/**
 * Migrate the next batch of products whose images are still on the Shopify CDN
 * into our own storage (S3). `skipIds` are products that failed on a previous
 * pass (e.g. a dead source image) so the loop can advance past them instead of
 * retrying forever. Returns how many were migrated this call, which failed, and
 * how many products still reference the Shopify CDN.
 */
export async function migrateBatch(
  skipIds: string[] = [],
): Promise<{ migrated: number; failedIds: string[]; remaining: number }> {
  await requireOwner();
  // Guard: never rewrite image URLs to local-disk paths (which only exist in
  // dev and would break production). Migration requires S3.
  if (!s3Configured()) {
    throw new Error("S3 is not configured — migration is disabled here.");
  }

  const products = await prisma.product.findMany({
    where: skipIds.length ? { AND: [shopifyWhere, { id: { notIn: skipIds } }] } : shopifyWhere,
    take: BATCH,
    select: { id: true, imageUrl: true, images: true },
  });

  // Dedupe identical source URLs across a batch (some products share photos).
  const cache = new Map<string, string>();
  async function convert(u: string): Promise<string> {
    if (!isShopifyUrl(u)) return u;
    const cached = cache.get(u);
    if (cached) return cached;
    const next = await migrateUrl(u);
    cache.set(u, next);
    return next;
  }

  let migrated = 0;
  const failedIds: string[] = [];
  for (const p of products) {
    try {
      const newPrimary = p.imageUrl ? await convert(p.imageUrl) : p.imageUrl;
      const gallery = p.images
        ? p.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const newGallery: string[] = [];
      for (const g of gallery) newGallery.push(await convert(g));
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: newPrimary, images: newGallery.join(",") },
      });
      migrated++;
    } catch (e) {
      console.error("[migrate-images] failed for product", p.id, e);
      failedIds.push(p.id);
    }
  }

  const remaining = await prisma.product.count({ where: shopifyWhere });
  return { migrated, failedIds, remaining };
}
