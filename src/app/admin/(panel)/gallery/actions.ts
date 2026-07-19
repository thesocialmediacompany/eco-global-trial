"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-guard";

function refresh() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/**
 * Publish a submitted photo. It takes the top slot (highest sortOrder) so the
 * newest approval leads the gallery; staff can rearrange from there.
 */
export async function approvePhoto(id: string) {
  await getAdminSession();
  const top = await prisma.communityPhoto.aggregate({
    where: { status: "approved" },
    _max: { sortOrder: true },
  });
  await prisma.communityPhoto.update({
    where: { id },
    data: {
      status: "approved",
      moderatedAt: new Date(),
      sortOrder: (top._max.sortOrder ?? 0) + 1,
    },
  });
  refresh();
}

/**
 * Move an approved photo one place earlier or later on the public gallery, by
 * swapping sortOrder with its neighbour. The gallery reads highest-first, so
 * "up" means swapping with the next photo above it.
 */
export async function movePhoto(id: string, formData: FormData) {
  await getAdminSession();
  const dir = String(formData.get("dir") ?? "");
  if (dir !== "up" && dir !== "down") return;

  const photo = await prisma.communityPhoto.findUnique({ where: { id } });
  if (!photo || photo.status !== "approved") return;

  const neighbour = await prisma.communityPhoto.findFirst({
    where:
      dir === "up"
        ? { status: "approved", sortOrder: { gt: photo.sortOrder } }
        : { status: "approved", sortOrder: { lt: photo.sortOrder } },
    orderBy: { sortOrder: dir === "up" ? "asc" : "desc" },
  });
  if (!neighbour) return; // already at the end

  await prisma.$transaction([
    prisma.communityPhoto.update({ where: { id: photo.id }, data: { sortOrder: neighbour.sortOrder } }),
    prisma.communityPhoto.update({ where: { id: neighbour.id }, data: { sortOrder: photo.sortOrder } }),
  ]);
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
