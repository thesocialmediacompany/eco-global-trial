import "server-only";
import { getStorage } from "@/lib/storage";

const SHOPIFY_HOST = "cdn.shopify.com";

export function isShopifyUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.includes(SHOPIFY_HOST));
}

/**
 * Download a Shopify-CDN-hosted image and re-upload it to our own storage
 * (S3 in production). Returns the new public URL. Non-Shopify URLs are returned
 * unchanged so the migration is idempotent and safe to re-run.
 */
export async function migrateUrl(url: string): Promise<string> {
  if (!isShopifyUrl(url)) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = (url.split("/").pop() || "image").split("?")[0] || "image";
  const { url: newUrl } = await getStorage().save({ buffer, filename, contentType });
  return newUrl;
}
