import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace). Submit
 * `${SITE_URL}/feed.xml` in Merchant Center for Google Shopping / free listings.
 */
export const revalidate = 3600; // refresh hourly

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    include: { variants: true },
  });

  const items = products
    .map((p) => {
      const inStock = p.variants.some((v) => v.inventoryQty > 0 && v.available);
      const image = p.imageUrl || (p.images ? p.images.split(",")[0].trim() : "");
      const desc = (p.description || p.tagline || p.title).replace(/<[^>]+>/g, "").slice(0, 4900);
      return `    <item>
      <g:id>${esc(p.slug)}</g:id>
      <g:title>${esc(p.title)}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${SITE_URL}/product/${esc(p.slug)}</g:link>
      ${image ? `<g:image_link>${esc(image)}</g:image_link>` : ""}
      <g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${p.price} PKR</g:price>
      <g:brand>Eco Global Foods</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Eco Global Foods</title>
    <link>${SITE_URL}</link>
    <description>Natural foods, granola, oats, flours and pantry staples.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
