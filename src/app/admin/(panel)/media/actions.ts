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
