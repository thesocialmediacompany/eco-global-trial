"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function horecaCollectionId() {
  const c = await prisma.collection.findUnique({
    where: { slug: "horeca" },
    select: { id: true },
  });
  return c?.id ?? null;
}

function revalidate() {
  revalidatePath("/admin/horeca");
  revalidatePath("/category/horeca");
}

/** Assign an existing product to the HORECA category. */
export async function addExistingToHoreca(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return;
  const id = await horecaCollectionId();
  if (!id) return;
  await prisma.product.update({ where: { id: productId }, data: { collectionId: id } });
  revalidate();
}

/** Remove a product from the HORECA category (leaves the product itself intact). */
export async function removeFromHoreca(productId: string) {
  await prisma.product.update({ where: { id: productId }, data: { collectionId: null } });
  revalidate();
}
