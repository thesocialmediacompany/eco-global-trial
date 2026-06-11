"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export interface BundleInput {
  title: string;
  tagline: string;
  description: string;
  price: number;
  status: string;
  imageUrl: string;
  emoji: string;
  items: { productId: string; quantity: number }[];
}

export type BundleResult = { ok: true; id: string } | { ok: false; error: string };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Sum the live value of bundle contents (member price × qty). */
async function contentsValue(items: { productId: string; quantity: number }[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    select: { id: true, price: true },
  });
  const priceById = new Map(products.map((p) => [p.id, p.price]));
  return items.reduce((s, i) => s + (priceById.get(i.productId) ?? 0) * i.quantity, 0);
}

async function bundlesCollectionId() {
  const existing = await prisma.collection.findUnique({ where: { slug: "bundles" } });
  if (existing) return existing.id;
  const created = await prisma.collection.create({
    data: {
      slug: "bundles",
      name: "Bundles",
      tagline: "Curated combos, better value",
      emoji: "🎁",
      gradient: "gradient-purple-green",
      sortOrder: 99,
    },
  });
  return created.id;
}

function validate(input: BundleInput): string | null {
  if (!input.title.trim()) return "Bundle title is required.";
  if (!Number.isFinite(input.price) || input.price <= 0) return "Set a bundle price.";
  const items = input.items.filter((i) => i.quantity > 0);
  if (items.length < 2) return "A bundle needs at least 2 products.";
  return null;
}

export async function createBundle(input: BundleInput): Promise<BundleResult> {
  const error = validate(input);
  if (error) return { ok: false, error };
  const items = input.items.filter((i) => i.quantity > 0);

  const value = await contentsValue(items);
  const slugBase = slugify(input.title) || `bundle-${Date.now()}`;
  const clash = await prisma.product.findUnique({ where: { slug: slugBase } });

  const bundle = await prisma.product.create({
    data: {
      slug: clash ? `${slugBase}-${Date.now().toString().slice(-4)}` : slugBase,
      title: input.title.trim(),
      tagline: input.tagline,
      description: input.description,
      status: input.status,
      isBundle: true,
      emoji: input.emoji || "🎁",
      gradient: "gradient-purple-green",
      badges: "Bundle, Better Value",
      imageUrl: input.imageUrl,
      price: Math.round(input.price),
      compareAtPrice: value > input.price ? value : null,
      collectionId: await bundlesCollectionId(),
      isNew: true,
      seoTitle: input.title.trim(),
      seoDescription: input.description.slice(0, 155),
      seoKeywords: "bundle, combo, value pack, eco global foods",
      variants: { create: [{ title: "Bundle", inventoryQty: 50, sortOrder: 0 }] },
      bundleItems: {
        create: items.map((i, idx) => ({
          productId: i.productId,
          quantity: i.quantity,
          sortOrder: idx,
        })),
      },
    },
  });

  revalidatePath("/admin/bundles");
  revalidatePath("/bundles");
  redirect(`/admin/bundles/${bundle.id}`);
}

export async function updateBundle(id: string, input: BundleInput): Promise<BundleResult> {
  const error = validate(input);
  if (error) return { ok: false, error };
  const items = input.items.filter((i) => i.quantity > 0);
  const value = await contentsValue(items);

  await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: {
        title: input.title.trim(),
        tagline: input.tagline,
        description: input.description,
        status: input.status,
        emoji: input.emoji || "🎁",
        imageUrl: input.imageUrl,
        price: Math.round(input.price),
        compareAtPrice: value > input.price ? value : null,
      },
    }),
    prisma.bundleItem.deleteMany({ where: { bundleId: id } }),
    prisma.bundleItem.createMany({
      data: items.map((i, idx) => ({
        bundleId: id,
        productId: i.productId,
        quantity: i.quantity,
        sortOrder: idx,
      })),
    }),
  ]);

  revalidatePath("/admin/bundles");
  revalidatePath(`/admin/bundles/${id}`);
  revalidatePath("/bundles");
  return { ok: true, id };
}

export async function deleteBundle(id: string) {
  await prisma.product.delete({ where: { id, isBundle: true } });
  revalidatePath("/admin/bundles");
  revalidatePath("/bundles");
  redirect("/admin/bundles");
}
