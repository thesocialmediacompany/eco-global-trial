import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL as BASE } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, posts] = await Promise.all([
    prisma.product.findMany({ where: { status: "active" }, select: { slug: true, updatedAt: true } }),
    prisma.collection.findMany({ select: { slug: true } }),
    prisma.post.findMany({ select: { slug: true, type: true, updatedAt: true } }),
  ]);

  const staticPaths = [
    { p: "", pr: 1 },
    { p: "/shop", pr: 0.9 },
    { p: "/sale", pr: 0.7 },
    { p: "/bundles", pr: 0.7 },
    { p: "/recipes", pr: 0.6 },
    { p: "/blog", pr: 0.6 },
    { p: "/about", pr: 0.6 },
    { p: "/stores", pr: 0.6 },
    { p: "/contact", pr: 0.5 },
    { p: "/faq", pr: 0.5 },
    { p: "/policies/privacy", pr: 0.3 },
    { p: "/policies/terms", pr: 0.3 },
    { p: "/policies/shipping", pr: 0.3 },
    { p: "/policies/refund", pr: 0.3 },
  ];

  const out: MetadataRoute.Sitemap = staticPaths.map((s) => ({
    url: `${BASE}${s.p}`,
    changeFrequency: "weekly",
    priority: s.pr,
  }));

  for (const c of collections) {
    out.push({ url: `${BASE}/category/${c.slug}`, changeFrequency: "weekly", priority: 0.8 });
  }
  for (const p of products) {
    out.push({ url: `${BASE}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.7 });
  }
  // Both blog posts and recipes use the /blog/[slug] detail route.
  for (const post of posts) {
    out.push({ url: `${BASE}/blog/${post.slug}`, lastModified: post.updatedAt, changeFrequency: "monthly", priority: 0.5 });
  }

  return out;
}
