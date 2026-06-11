import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

const BASE = "https://www.ecoglobalfoods.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [""].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: 1,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
