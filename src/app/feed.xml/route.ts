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
    include: { variants: true, collection: true },
  });

  const items = products
    .map((p) => {
      const image = p.imageUrl || (p.images ? p.images.split(",")[0].trim() : "");
      // Merchant Center requires an image_link; a product without a photo would
      // be disapproved, so skip it here (add a photo in admin to list it).
      if (!image) return "";
      const inStock = p.variants.some((v) => v.inventoryQty > 0 && v.available);
      const desc =
        (p.description || p.tagline || p.title)
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 4900) || p.title;
      // Show a strike-through sale in Shopping when there's a higher compare-at.
      const compareAt = p.variants.find((v) => v.compareAtPrice && v.compareAtPrice > p.price)
        ?.compareAtPrice;
      const priceLines = compareAt
        ? `      <g:price>${compareAt} PKR</g:price>\n      <g:sale_price>${p.price} PKR</g:sale_price>`
        : `      <g:price>${p.price} PKR</g:price>`;
      const productType = p.collection?.name
        ? `\n      <g:product_type>${esc(p.collection.name)}</g:product_type>`
        : "";
      return `    <item>
      <g:id>${esc(p.slug)}</g:id>
      <g:title>${esc(p.title)}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${SITE_URL}/product/${esc(p.slug)}</g:link>
      <g:image_link>${esc(image)}</g:image_link>
      <g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>
${priceLines}
      <g:brand>Eco Global Foods</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items</g:google_product_category>${productType}
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .filter(Boolean)
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
