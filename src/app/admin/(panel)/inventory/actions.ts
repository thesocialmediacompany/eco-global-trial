"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Bulk-update variant stock. Inputs are named `qty:<variantId>`. */
export async function updateInventory(formData: FormData) {
  const updates: { id: string; qty: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("qty:")) {
      const id = key.slice(4);
      const qty = Math.max(0, Math.round(Number(value)) || 0);
      updates.push({ id, qty });
    }
  }
  if (updates.length === 0) return;

  await prisma.$transaction(
    updates.map((u) =>
      prisma.variant.update({
        where: { id: u.id },
        data: { inventoryQty: u.qty, available: u.qty > 0 },
      }),
    ),
  );
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
