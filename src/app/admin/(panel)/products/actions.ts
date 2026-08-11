"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * The storefront now caches its catalog pages (ISR, ~30 min) so around-the-clock
 * bot crawls don't wake the database on every hit. That means an admin edit
 * would otherwise take up to the cache window to appear publicly — so bust every
 * surface a product can show on the moment one is saved. The `"page"` type
 * revalidates all instances of the dynamic route (fine for this catalog size).
 */
function revalidateStorefront() {
  revalidatePath("/", "layout"); // home + featured + nav
  revalidatePath("/shop");
  revalidatePath("/sale");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/category/[slug]", "page");
}

interface VariantInput {
  id?: string;
  title: string;
  price?: number | null;
  compareAtPrice?: number | null;
  inventoryQty?: number;
  weightGrams?: number;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** A slug guaranteed not to collide (slug is @unique — a clash would 500). */
async function uniqueProductSlug(title: string): Promise<string> {
  const base = slugify(title) || `product-${Date.now()}`;
  let slug = base;
  for (let i = 2; i < 100; i++) {
    if (!(await prisma.product.findUnique({ where: { slug }, select: { id: true } }))) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

/** Parse the shared product form fields into a Prisma-ready object. */
function parseForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const priceNum = Number(formData.get("price") ?? 0);
  const compareRaw = formData.get("compareAtPrice");
  const compareAtPrice = compareRaw ? Number(compareRaw) : null;

  let variants: VariantInput[] = [];
  try {
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    variants = [];
  }

  const primaryId = String(formData.get("collectionId") ?? "") || null;
  // "Also appears in" checkboxes. Keep only real, distinct ids, and never the
  // primary (that membership is already covered by collectionId).
  const extraCollectionIds = [
    ...new Set(formData.getAll("extraCollectionIds").map(String).filter(Boolean)),
  ].filter((id) => id !== primaryId);

  return {
    title,
    extraCollectionIds,
    fields: {
      title,
      tagline: String(formData.get("tagline") ?? ""),
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "active"),
      emoji: String(formData.get("emoji") ?? "🌿"),
      gradient: String(formData.get("gradient") ?? "gradient-purple"),
      imageUrl: String(formData.get("imageUrl") ?? "").trim(),
      images: String(formData.get("images") ?? "").trim(),
      badges: String(formData.get("badges") ?? ""),
      price: Number.isFinite(priceNum) ? Math.round(priceNum) : 0,
      compareAtPrice:
        compareAtPrice && Number.isFinite(compareAtPrice)
          ? Math.round(compareAtPrice)
          : null,
      vendor: String(formData.get("vendor") ?? "Eco Global Foods"),
      isNew: formData.get("isNew") === "on",
      isBestseller: formData.get("isBestseller") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      collectionId: String(formData.get("collectionId") ?? "") || null,
      seoTitle: String(formData.get("seoTitle") ?? ""),
      seoDescription: String(formData.get("seoDescription") ?? ""),
      seoKeywords: String(formData.get("seoKeywords") ?? ""),
      ingredients: String(formData.get("ingredients") ?? ""),
      allergens: String(formData.get("allergens") ?? ""),
      nutritionJson: String(formData.get("nutritionJson") ?? ""),
      faqJson: String(formData.get("faqJson") ?? ""),
    },
    variants,
  };
}

export async function createProduct(formData: FormData) {
  const { title, fields, variants, extraCollectionIds } = parseForm(formData);
  if (!title) return;

  const product = await prisma.product.create({
    data: {
      ...fields,
      slug: await uniqueProductSlug(title),
      variants: {
        create: (variants.length ? variants : [{ title: "Default" }]).map(
          (v, i) => ({
            title: v.title || "Default",
            price: v.price ?? null,
            compareAtPrice: v.compareAtPrice ?? null,
            inventoryQty: v.inventoryQty ?? 0,
            weightGrams: v.weightGrams ?? 0,
            sortOrder: i,
          }),
        ),
      },
      // Additional collections this product also appears in.
      collectionLinks: {
        create: extraCollectionIds.map((collectionId) => ({ collectionId })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidateStorefront();
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const { fields, variants, extraCollectionIds } = parseForm(formData);

  // The variant sync is a delete-and-recreate, but the product form doesn't
  // carry `sku` or `available`, so recreating blindly would wipe every SKU and
  // flip out-of-stock variants back to available. Preserve those by title.
  const existingVariants = await prisma.variant.findMany({
    where: { productId: id },
    select: { title: true, sku: true, available: true },
  });
  const preserved = new Map(existingVariants.map((v) => [v.title, v]));

  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: fields }),
    // Simplest reliable sync: replace variants for this product.
    prisma.variant.deleteMany({ where: { productId: id } }),
    prisma.variant.createMany({
      data: (variants.length ? variants : [{ title: "Default" }]).map((v, i) => {
        const keep = preserved.get(v.title || "Default");
        return {
          productId: id,
          title: v.title || "Default",
          price: v.price ?? null,
          compareAtPrice: v.compareAtPrice ?? null,
          inventoryQty: v.inventoryQty ?? 0,
          weightGrams: v.weightGrams ?? 0,
          sku: keep?.sku ?? "",
          available: keep?.available ?? true,
          sortOrder: i,
        };
      }),
    }),
    // Same replace-and-recreate for the additional-collection links.
    prisma.productCollection.deleteMany({ where: { productId: id } }),
    prisma.productCollection.createMany({
      data: extraCollectionIds.map((collectionId) => ({ productId: id, collectionId })),
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidateStorefront();
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidateStorefront();
  redirect("/admin/products");
}
