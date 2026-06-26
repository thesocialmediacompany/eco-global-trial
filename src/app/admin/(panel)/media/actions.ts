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
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
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

export async function deleteCatalog(id: string) {
  await requireOwner();
  await prisma.catalogFile.delete({ where: { id } });
  revalidateAll();
}
