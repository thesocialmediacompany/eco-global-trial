"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  return {
    name,
    slug: slugify(slugInput || name),
    data: {
      name,
      tagline: String(formData.get("tagline") ?? ""),
      description: String(formData.get("description") ?? ""),
      emoji: String(formData.get("emoji") ?? "🌿"),
      gradient: String(formData.get("gradient") ?? "gradient-purple"),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      isNew: formData.get("isNew") === "on",
      seoTitle: String(formData.get("seoTitle") ?? ""),
      seoDescription: String(formData.get("seoDescription") ?? ""),
      seoKeywords: String(formData.get("seoKeywords") ?? ""),
    },
  };
}

export async function createCollection(formData: FormData) {
  const { name, slug, data } = parse(formData);
  if (!name) return;
  const exists = await prisma.collection.findUnique({ where: { slug } });
  const finalSlug = exists ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
  const c = await prisma.collection.create({ data: { ...data, slug: finalSlug } });
  revalidatePath("/admin/collections");
  redirect(`/admin/collections/${c.id}`);
}

export async function updateCollection(id: string, formData: FormData) {
  const { slug, data } = parse(formData);
  // keep slug unique if changed
  const clash = await prisma.collection.findFirst({ where: { slug, NOT: { id } } });
  await prisma.collection.update({
    where: { id },
    data: { ...data, slug: clash ? `${slug}-${Date.now().toString().slice(-4)}` : slug },
  });
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${id}`);
  revalidatePath("/shop");
}

export async function deleteCollection(id: string) {
  // detach products first (collectionId is optional)
  await prisma.product.updateMany({ where: { collectionId: id }, data: { collectionId: null } });
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}
