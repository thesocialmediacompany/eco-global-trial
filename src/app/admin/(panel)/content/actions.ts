"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  return {
    title,
    data: {
      title,
      excerpt: String(formData.get("excerpt") ?? ""),
      body: String(formData.get("body") ?? ""),
      coverEmoji: String(formData.get("coverEmoji") ?? "🌿"),
      gradient: String(formData.get("gradient") ?? "gradient-purple"),
      author: String(formData.get("author") ?? "Eco Global Foods"),
      type: String(formData.get("type") ?? "blog") === "recipe" ? "recipe" : "blog",
      category: String(formData.get("category") ?? "Wellness"),
      status: String(formData.get("status") ?? "published"),
      readMinutes: Number(formData.get("readMinutes") ?? 4) || 4,
      seoTitle: String(formData.get("seoTitle") ?? ""),
      seoDescription: String(formData.get("seoDescription") ?? ""),
      seoKeywords: String(formData.get("seoKeywords") ?? ""),
    },
  };
}

export async function createPost(formData: FormData) {
  const { title, data } = parse(formData);
  if (!title) return;
  const post = await prisma.post.create({
    data: { ...data, slug: slugify(title) || `post-${Date.now()}` },
  });
  revalidatePath("/admin/content");
  revalidatePath("/blog");
  revalidatePath("/recipes");
  redirect(`/admin/content/${post.id}`);
}

export async function updatePost(id: string, formData: FormData) {
  const { data } = parse(formData);
  await prisma.post.update({ where: { id }, data });
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);
  revalidatePath("/blog");
  revalidatePath("/recipes");
}

export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/blog");
  revalidatePath("/recipes");
  redirect("/admin/content");
}
