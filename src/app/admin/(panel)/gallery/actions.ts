"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-guard";

function refresh() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/** Publish a submitted photo to the public gallery. */
export async function approvePhoto(id: string) {
  await getAdminSession();
  await prisma.communityPhoto.update({
    where: { id },
    data: { status: "approved", moderatedAt: new Date() },
  });
  refresh();
}

/** Hide a photo without deleting it (keeps a record of what was declined). */
export async function rejectPhoto(id: string) {
  await getAdminSession();
  await prisma.communityPhoto.update({
    where: { id },
    data: { status: "rejected", moderatedAt: new Date() },
  });
  refresh();
}

/** Remove a photo entirely. */
export async function deletePhoto(id: string) {
  await getAdminSession();
  await prisma.communityPhoto.delete({ where: { id } });
  refresh();
}

/** Attach the photo to a product so it links there from the gallery. */
export async function tagPhotoProduct(id: string, formData: FormData) {
  await getAdminSession();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  await prisma.communityPhoto.update({ where: { id }, data: { productSlug } });
  refresh();
}
