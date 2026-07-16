/**
 * Core domain types for the Eco Global Foods storefront + future admin backend.
 * These are intentionally backend-agnostic so they can later be backed by
 * Prisma models / API responses without touching the UI layer.
 */

export interface SeoMeta {
  /** <title> - keep under ~60 chars. */
  title: string;
  /** meta description - keep under ~160 chars. */
  description: string;
  keywords: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** short marketing line shown on category cards */
  tagline: string;
  /** decorative gradient utility class used for the card background */
  gradient: "gradient-purple" | "gradient-green" | "gradient-purple-green";
  emoji: string;
  /** whether this is part of the newly launched premium range */
  isNew?: boolean;
  seo: SeoMeta;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** category slug */
  category: string;
  tagline: string;
  description: string;
  /** retail price in PKR */
  price: number;
  /** optional strike-through price for showing a discount */
  compareAtPrice?: number;
  flavours?: string[];
  badges?: string[];
  emoji: string;
  /** primary product image URL (empty → fall back to emoji/gradient art) */
  imageUrl?: string;
  /** additional image URLs */
  images?: string[];
  /** tailwind gradient utility for the placeholder pack art */
  gradient: "gradient-purple" | "gradient-green" | "gradient-purple-green";
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  /** false when every variant is out of stock / unavailable */
  inStock?: boolean;
  /** representative net weight in grams (first variant) for shipping estimates */
  weightGrams?: number;
  /** food labelling */
  ingredients?: string;
  allergens?: string[];
  nutrition?: { label: string; value: string }[];
  /** when this product is a bundle: the products inside it */
  bundleContents?: BundleContent[];
  seo: SeoMeta;
}

export interface BundleContent {
  slug: string;
  title: string;
  price: number;
  quantity: number;
  emoji: string;
  gradient: string;
  imageUrl?: string;
}
