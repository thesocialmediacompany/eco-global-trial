"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Save ONLY the variants whose stock actually changed.
 *
 * The previous version posted every variant on the page (269 fields, ~9 KB),
 * which the WAF blocks at 8 KB - so saving silently failed. Sending just the
 * edited rows keeps the request tiny and works regardless of catalogue size.
 */
export async function saveInventory(
  changes: { id: string; qty: number }[],
): Promise<{ saved: number }> {
  const clean = (changes ?? [])
    .filter((c) => c && typeof c.id === "string" && Number.isFinite(c.qty))
    .map((c) => ({ id: c.id, qty: Math.max(0, Math.round(c.qty)) }));

  if (clean.length === 0) return { saved: 0 };

  await prisma.$transaction(
    clean.map((u) =>
      prisma.variant.update({
        where: { id: u.id },
        data: { inventoryQty: u.qty, available: u.qty > 0 },
      }),
    ),
  );

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  // Storefront catalog pages are ISR-cached, so refresh the stock badges now
  // rather than after the cache window. (Checkout re-checks stock live, so this
  // is about display accuracy, not oversell safety.)
  revalidatePath("/shop");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/category/[slug]", "page");
  return { saved: clean.length };
}
