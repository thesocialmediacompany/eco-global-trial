"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";

function revalidateAll() {
  revalidatePath("/admin/media");
  revalidatePath("/about");
  revalidatePath("/");
}

export async function addGalleryImage(formData: FormData) {
  await requireOwner();
  await prisma.galleryImage.create({
    data: {
      url: String(formData.get("url") ?? "").trim(),
      caption: String(formData.get("caption") ?? "").trim(),
      emoji: String(formData.get("emoji") ?? "📸").trim() || "📸",
      gradient: String(formData.get("gradient") ?? "gradient-green"),
      featured: formData.get("featured") === "on",
      productSlug: String(formData.get("productSlug") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    },
  });
  revalidateAll();
}

export async function updateGalleryImage(id: string, formData: FormData) {
  await requireOwner();
  const newUrl = String(formData.get("url") ?? "").trim();
  await prisma.galleryImage.update({
    where: { id },
    data: {
      caption: String(formData.get("caption") ?? "").trim(),
      emoji: String(formData.get("emoji") ?? "📸").trim() || "📸",
      gradient: String(formData.get("gradient") ?? "gradient-green"),
      featured: formData.get("featured") === "on",
      productSlug: String(formData.get("productSlug") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      // only replace the photo when a new one was uploaded
      ...(newUrl ? { url: newUrl } : {}),
    },
  });
  revalidateAll();
}

/**
 * Persist a whole drag-and-drop sequence. `ids` arrive in display order and the
 * gallery lists ascending, so position maps straight to sortOrder. Writing the
 * full order in one transaction keeps a long drag correct, which pairwise
 * swapping can't do.
 */
export async function reorderGalleryImages(ids: string[]) {
  await requireOwner();
  const clean = ids.filter(Boolean);
  if (clean.length === 0) return;
  await prisma.$transaction(
    clean.map((id, i) => prisma.galleryImage.update({ where: { id }, data: { sortOrder: i } })),
  );
  revalidateAll();
}

/**
 * Move a gallery image one place earlier or later by swapping sortOrder with
 * its neighbour — kept alongside drag for phones, where dragging is awkward.
 */
export async function moveGalleryImage(id: string, formData: FormData) {
  await requireOwner();
  const dir = String(formData.get("dir") ?? "");
  if (dir !== "up" && dir !== "down") return;

  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) return;

  // The gallery lists by sortOrder ascending, so "up" is the lower number.
  const neighbour = await prisma.galleryImage.findFirst({
    where: dir === "up" ? { sortOrder: { lt: image.sortOrder } } : { sortOrder: { gt: image.sortOrder } },
    orderBy: { sortOrder: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.galleryImage.update({ where: { id: image.id }, data: { sortOrder: neighbour.sortOrder } }),
    prisma.galleryImage.update({ where: { id: neighbour.id }, data: { sortOrder: image.sortOrder } }),
  ]);
  revalidateAll();
}

export async function deleteGalleryImage(id: string) {
  await requireOwner();
  await prisma.galleryImage.delete({ where: { id } });
  revalidateAll();
}

export async function addCatalog(formData: FormData) {
  await requireOwner();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await prisma.catalogFile.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      fileUrl: String(formData.get("fileUrl") ?? "").trim(),
      sizeLabel: String(formData.get("sizeLabel") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    },
  });
  revalidateAll();
}

export async function updateCatalog(id: string, formData: FormData) {
  await requireOwner();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  // Only replace the file when a new one was uploaded (the upload field is
  // blank unless the user picked a file); otherwise keep the existing PDF.
  const newFileUrl = String(formData.get("fileUrl") ?? "").trim();
  const newSize = String(formData.get("sizeLabel") ?? "").trim();
  await prisma.catalogFile.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      ...(newFileUrl ? { fileUrl: newFileUrl, sizeLabel: newSize } : {}),
    },
  });
  revalidateAll();
}

export async function deleteCatalog(id: string) {
  await requireOwner();
  await prisma.catalogFile.delete({ where: { id } });
  revalidateAll();
}
