import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";

type DbProductWithRels = Prisma.ProductGetPayload<{
  include: { variants: true; collection: true };
}>;

/** Safely parse the stored nutrition JSON into label/value rows. */
function parseNutrition(json: string): { label: string; value: string }[] {
  if (!json) return [];
  try {
    const rows = JSON.parse(json);
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((r) => r && typeof r.label === "string" && typeof r.value === "string")
      .map((r) => ({ label: r.label, value: r.value }));
  } catch {
    return [];
  }
}

/** Map a Prisma product row to the storefront card/detail `Product` shape. */
export function toCardProduct(p: DbProductWithRels): Product & {
  variants: { title: string; price: number | null; inventoryQty: number; weightGrams: number }[];
} {
  return {
    id: p.id,
    slug: p.slug,
    name: p.title,
    category: p.collection?.slug ?? "",
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    flavours: p.variants.map((v) => v.title),
    badges: p.badges ? p.badges.split(",").map((b) => b.trim()).filter(Boolean) : [],
    emoji: p.emoji,
    imageUrl: p.imageUrl || undefined,
    images: p.images ? p.images.split(",").map((i) => i.trim()).filter(Boolean) : [],
    gradient: p.gradient as Product["gradient"],
    rating: p.rating ?? undefined,
    reviewCount: p.reviewCount,
    isNew: p.isNew,
    isBestseller: p.isBestseller,
    isFeatured: p.isFeatured,
    weightGrams: p.variants[0]?.weightGrams ?? 0,
    ingredients: p.ingredients || undefined,
    allergens: p.allergens
      ? p.allergens.split(",").map((a) => a.trim()).filter(Boolean)
      : [],
    nutrition: parseNutrition(p.nutritionJson),
    seo: {
      title: p.seoTitle || p.title,
      description: p.seoDescription || p.tagline,
      keywords: p.seoKeywords
        ? p.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [],
    },
    variants: p.variants.map((v) => ({
      title: v.title,
      price: v.price,
      inventoryQty: v.inventoryQty,
      weightGrams: v.weightGrams,
    })),
  };
}

const include = { variants: { orderBy: { sortOrder: "asc" } }, collection: true } as const;

export async function getActiveProducts() {
  const rows = await prisma.product.findMany({
    where: { status: "active" },
    include,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCardProduct);
}

export async function getNewArrivals() {
  const rows = await prisma.product.findMany({
    where: { status: "active", isNew: true },
    include,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCardProduct);
}

export type ShopSort = "new" | "price-asc" | "price-desc" | "name";

export interface ShopFilters {
  sort?: ShopSort;
  collection?: string; // collection slug
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isNew?: boolean;
}

/** Filtered + sorted product listing for the /shop page. */
export async function getShopProducts(opts: ShopFilters = {}) {
  const where: Prisma.ProductWhereInput = { status: "active" };
  if (opts.isNew) where.isNew = true;
  if (opts.collection) where.collection = { slug: opts.collection };
  if (opts.minPrice != null || opts.maxPrice != null) {
    where.price = {};
    if (opts.minPrice != null) where.price.gte = opts.minPrice;
    if (opts.maxPrice != null) where.price.lte = opts.maxPrice;
  }
  if (opts.inStock) {
    where.variants = { some: { inventoryQty: { gt: 0 }, available: true } };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    opts.sort === "price-asc"
      ? { price: "asc" }
      : opts.sort === "price-desc"
        ? { price: "desc" }
        : opts.sort === "name"
          ? { title: "asc" }
          : { createdAt: "desc" };

  const rows = await prisma.product.findMany({ where, include, orderBy });
  return rows.map(toCardProduct);
}

/** Min/max price across active products, for the shop price-filter bounds. */
export async function getPriceRange() {
  const agg = await prisma.product.aggregate({
    where: { status: "active" },
    _min: { price: true },
    _max: { price: true },
  });
  return { min: agg._min.price ?? 0, max: agg._max.price ?? 0 };
}

/** Products hand-picked for the homepage. Falls back to new arrivals if none set. */
export async function getFeaturedProducts(take = 8) {
  const rows = await prisma.product.findMany({
    where: { status: "active", isFeatured: true },
    include,
    orderBy: { createdAt: "desc" },
    take,
  });
  if (rows.length > 0) return rows.map(toCardProduct);
  // graceful fallback so the homepage is never empty
  const fallback = await prisma.product.findMany({
    where: { status: "active", isNew: true },
    include,
    orderBy: { createdAt: "desc" },
    take,
  });
  return fallback.map(toCardProduct);
}

export async function getProductBySlug(slug: string) {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: {
      ...include,
      bundleItems: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
  });
  if (!row) return null;
  const product = toCardProduct(row);
  if (row.isBundle && row.bundleItems.length > 0) {
    product.bundleContents = row.bundleItems.map((bi) => ({
      slug: bi.product.slug,
      title: bi.product.title,
      price: bi.product.price,
      quantity: bi.quantity,
      emoji: bi.product.emoji,
      gradient: bi.product.gradient,
      imageUrl: bi.product.imageUrl || undefined,
    }));
  }
  return product;
}

export async function getProductsByCollection(collectionSlug: string) {
  const rows = await prisma.product.findMany({
    where: { status: "active", collection: { slug: collectionSlug } },
    include,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCardProduct);
}

export async function getRelatedProducts(collectionSlug: string, excludeSlug: string, take = 4) {
  const rows = await prisma.product.findMany({
    where: {
      status: "active",
      collection: { slug: collectionSlug },
      slug: { not: excludeSlug },
    },
    include,
    take,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCardProduct);
}

export async function searchProducts(query: string) {
  const q = query.trim();
  if (!q) return [];
  const rows = await prisma.product.findMany({
    where: {
      status: "active",
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { badges: { contains: q } },
      ],
    },
    include,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCardProduct);
}
