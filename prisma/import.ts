/**
 * Canonical seed — imports REAL catalogue data captured from the live Shopify
 * store (ecoglobalfoods.com) under prisma/import-data/. Produces real products,
 * size/flavour variants, prices, CDN images, descriptions and SEO, mapped to the
 * store's collections. Also seeds staff, sample orders, blog posts, discounts and
 * default store settings.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedPosts } from "../src/data/posts";
import { defaultSettings } from "../src/lib/settings-defaults";

const prisma = new PrismaClient();
const dataDir = join(process.cwd(), "prisma", "import-data");
const read = (f: string) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));

// ── Collection metadata (Shopify handle → storefront presentation) ──────────
const collectionMeta: Record<
  string,
  { name: string; tagline: string; emoji: string; gradient: string }
> = {
  "granola-cereals": { name: "Granola & Cereal", tagline: "Crunchy, wholesome mornings", emoji: "🥣", gradient: "gradient-purple" },
  "oats-family": { name: "Oats Family", tagline: "Ready in minutes", emoji: "🌾", gradient: "gradient-green" },
  "morning-essentials": { name: "Morning Essentials", tagline: "Start the day right", emoji: "☀️", gradient: "gradient-purple-green" },
  "flours-flours": { name: "Flours", tagline: "From farm to flour", emoji: "🌾", gradient: "gradient-green" },
  "baking-products": { name: "Baking Products", tagline: "Bake with goodness", emoji: "🧁", gradient: "gradient-purple" },
  "spices-spices": { name: "Spices", tagline: "Authentic, pure blends", emoji: "🌶️", gradient: "gradient-purple-green" },
  herbs: { name: "Herbs", tagline: "Wellness from the earth", emoji: "🌿", gradient: "gradient-green" },
  "seeds-grains": { name: "Seeds & Grains", tagline: "Nature's tiny powerhouses", emoji: "🌱", gradient: "gradient-green" },
  "dry-fruits": { name: "Dry Fruits", tagline: "Premium, hand-picked", emoji: "🥜", gradient: "gradient-purple" },
  "gluten-free": { name: "Gluten Free", tagline: "Pure & worry-free", emoji: "🌾", gradient: "gradient-purple-green" },
  "batter-marination": { name: "Batter & Marination", tagline: "Restaurant taste at home", emoji: "🍗", gradient: "gradient-purple" },
  "dehydrated-dehydrated": { name: "Dehydrated", tagline: "Flavour, locked in", emoji: "🧅", gradient: "gradient-green" },
  bundles: { name: "Bundles", tagline: "Curated combos, better value", emoji: "🎁", gradient: "gradient-purple-green" },
};

const typeFallback: Record<string, string> = {
  "Herbs and Spices": "spices-spices",
  Spices: "spices-spices",
  Recipe: "batter-marination",
  "Batter and Marination": "batter-marination",
  "Dried Powder Range": "dehydrated-dehydrated",
  "Breakfast Essentials": "morning-essentials",
  Flour: "flours-flours",
  "Flour Range": "flours-flours",
  "Seeds and grains": "seeds-grains",
  "Gut Health": "seeds-grains",
  "Dry Fruits": "dry-fruits",
  "Desert Range": "baking-products",
  rice: "seeds-grains",
};

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<\s*(br|\/p|\/div|\/li)\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&[a-z]+;/gi, " ")
    // normalise dashes so copy doesn't read machine-generated
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2") // numeric ranges: 2–5 -> 2-5
    .replace(/\s*[–—]\s*/g, ", ") // em/en dash connectors -> comma
    .replace(/,\s*,/g, ",")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n").map((l) => l.trim()).join("\n")
    .trim();
}

/** Parse a net weight in grams from a variant title like "250g" or "1kg". */
function weightFromTitle(title: string | null | undefined): number {
  if (!title) return 0;
  const m = String(title).match(/([\d.]+)\s*(kg|g|ml|l)\b/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return 0;
  const unit = m[2].toLowerCase();
  if (unit === "kg" || unit === "l") return Math.round(n * 1000);
  return Math.round(n); // g or ml
}

function toRupees(s: string | null | undefined): number | null {
  if (s == null) return null;
  const n = Math.round(parseFloat(s));
  return Number.isFinite(n) ? n : null;
}

function categoryFor(handle: string, productType: string, map: Record<string, string>): string {
  if (map[handle] && collectionMeta[map[handle]]) return map[handle];
  if (typeFallback[productType] && collectionMeta[typeFallback[productType]]) {
    return typeFallback[productType];
  }
  if (/protein|bar/i.test(handle)) return "granola-cereals";
  return "morning-essentials";
}

async function main() {
  console.log("🌱  Importing REAL Eco Global Foods catalogue…");

  const products = read("products.json").products as any[];
  const prodCol = read("product-collections.json") as Record<string, string>;
  const flags = read("flags.json") as Record<string, string[]>;
  const newArrivals = new Set(flags["new-arrivals"] ?? []);
  const topSelling = new Set(flags["top-selling-products"] ?? []);

  // clean slate
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staffUser.deleteMany();
  await prisma.post.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.setting.deleteMany();

  // staff
  await prisma.staffUser.create({
    data: {
      email: "admin@ecoglobalfoods.com",
      name: "EGF Admin",
      passwordHash: await bcrypt.hash("ecoadmin123", 10),
      role: "owner",
    },
  });

  // collections
  const colId = new Map<string, string>();
  let order = 0;
  for (const [slug, meta] of Object.entries(collectionMeta)) {
    const c = await prisma.collection.create({
      data: {
        slug,
        name: meta.name,
        tagline: meta.tagline,
        emoji: meta.emoji,
        gradient: meta.gradient,
        sortOrder: order++,
        description: `Natural ${meta.name.toLowerCase()} from Eco Global Foods.`,
        seoTitle: `${meta.name} | Eco Global Foods`,
        seoDescription: `${meta.tagline}. Natural ${meta.name.toLowerCase()} with pure ingredients, delivered across Pakistan.`,
        seoKeywords: `${meta.name.toLowerCase()}, natural foods, eco global foods`,
      },
    });
    colId.set(slug, c.id);
  }
  console.log(`   • ${colId.size} collections`);

  // products
  const gradients = ["gradient-purple", "gradient-green", "gradient-purple-green"];
  let imported = 0;
  let idx = 0;
  for (const p of products) {
    const handle: string = p.handle;
    const slugCol = categoryFor(handle, p.product_type ?? "", prodCol);
    const meta = collectionMeta[slugCol];
    const description = stripHtml(p.body_html ?? "");
    const tagline =
      description.split("\n")[0].slice(0, 120) || `${p.title} from Eco Global Foods`;
    const tags: string[] = Array.isArray(p.tags)
      ? p.tags
      : String(p.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean);

    const images: string[] = (p.images ?? []).map((im: any) => im.src).filter(Boolean);
    const variants = (p.variants ?? []) as any[];
    const prices = variants.map((v) => toRupees(v.price)).filter((n): n is number => n != null);
    const basePrice = prices.length ? Math.min(...prices) : 0;
    const baseCompare =
      toRupees(variants[0]?.compare_at_price) ?? null;

    const created = await prisma.product.create({
      data: {
        slug: handle,
        title: p.title.replace(/\s*\+\s*$/, "").trim(),
        tagline,
        description,
        status: "active",
        emoji: meta.emoji,
        gradient: gradients[idx % 3],
        badges: tags.slice(0, 2).map((t) => t.replace(/\b\w/g, (c) => c.toUpperCase())).join(", "),
        imageUrl: images[0] ?? "",
        images: images.slice(1, 6).join(","),
        price: basePrice,
        compareAtPrice: baseCompare && baseCompare > basePrice ? baseCompare : null,
        vendor: "Eco Global Foods",
        isNew: newArrivals.has(handle),
        isBestseller: topSelling.has(handle),
        isFeatured: topSelling.has(handle), // homepage featured = top-selling by default

        rating: null, // set from real reviews after import (no fabricated ratings)
        reviewCount: 0,
        seoTitle: (p.title.length <= 60 ? p.title : p.title.slice(0, 57) + "…"),
        seoDescription: (description.replace(/\n/g, " ").slice(0, 155) || tagline),
        seoKeywords: tags.slice(0, 10).join(", "),
        collectionId: colId.get(slugCol)!,
        variants: {
          create: variants.map((v, i) => ({
            title: v.option1 || v.title || "Default",
            sku: v.sku ?? "",
            price: toRupees(v.price),
            compareAtPrice: toRupees(v.compare_at_price),
            weightGrams: weightFromTitle(v.option1 || v.title) || Number(v.grams) || 0,
            available: v.available !== false,
            inventoryQty: v.available === false ? 0 : 100,
            sortOrder: v.position ?? i,
          })),
        },
      },
    });
    void created;
    imported++;
    idx++;
  }
  console.log(`   • ${imported} products (real images, variants, SEO)`);

  // ── Curated bundles ──────────────────────────────────────────────
  const bundlesColId = colId.get("bundles")!;
  const allCreated = await prisma.product.findMany({
    select: { id: true, slug: true, imageUrl: true, price: true },
  });
  const bySlug = new Map(allCreated.map((p) => [p.slug, p]));
  const pickImg = (slugs: string[]) => {
    for (const s of slugs) { const p = bySlug.get(s); if (p?.imageUrl) return p.imageUrl; }
    return "";
  };
  const bundleDefs = [
    {
      slug: "breakfast-goodness-bundle",
      title: "Breakfast Goodness Bundle",
      tagline: "A wholesome week of mornings, sorted",
      description: "Everything you need for a good breakfast: our muesli, rolled oats and a malted drink, together at a better price.",
      members: ["muesli-swiss-style", "rolled-oats", "vanilla-flavor-powder"],
      price: 1450, compareAtPrice: 1850, emoji: "🥣",
    },
    {
      slug: "wellness-essentials-bundle",
      title: "Wellness Essentials Bundle",
      tagline: "Seeds, herbs & dry fruits for daily wellness",
      description: "A curated mix of nutrient-dense seeds, natural herbs and premium dry fruits to power a balanced, healthy lifestyle.",
      members: ["whole-grain-hulled-barley", "cinnamon-sticks", "paprika-powder"],
      price: 1650, compareAtPrice: 2100, emoji: "🌿",
    },
    {
      slug: "bakers-pantry-bundle",
      title: "Baker's Pantry Bundle",
      tagline: "Stock your pantry for wholesome baking",
      description: "Flour, baking essentials and aromatic spices, a simple starter kit for healthier home baking.",
      members: ["black-salt", "paprika-powder", "cinnamon-sticks"],
      price: 1250, compareAtPrice: 1600, emoji: "🧁",
    },
  ];
  for (const [i, b] of bundleDefs.entries()) {
    // resolve member products that actually exist in the imported catalogue
    const members = b.members
      .map((slug) => bySlug.get(slug))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));
    const contentsValue = members.reduce((s, m) => s + m.price, 0);

    await prisma.product.create({
      data: {
        slug: b.slug,
        title: b.title,
        tagline: b.tagline,
        description: b.description,
        status: "active",
        isBundle: true,
        emoji: b.emoji,
        gradient: gradients[i % 3],
        badges: "Bundle, Better Value",
        imageUrl: pickImg(b.members),
        price: b.price,
        // compare-at = real value of contents (falls back to the curated figure)
        compareAtPrice: contentsValue > b.price ? contentsValue : b.compareAtPrice,
        collectionId: bundlesColId,
        isNew: true,
        rating: null,
        reviewCount: 0,
        seoTitle: b.title,
        seoDescription: b.description.slice(0, 155),
        seoKeywords: "bundle, combo, eco global foods, value pack",
        variants: { create: [{ title: "Bundle", inventoryQty: 50, sortOrder: 0 }] },
        bundleItems: {
          create: members.map((m, idx) => ({
            productId: m.id,
            quantity: 1,
            sortOrder: idx,
          })),
        },
      },
    });
  }
  console.log(`   • ${bundleDefs.length} curated bundles (with linked contents)`);

  // ── Real reviews scraped from the live store (Judge.me) ──────────
  const reviewsByHandle = read("reviews.json") as Record<
    string,
    { rating: number; author: string; title: string; body: string }[]
  >;
  const productBySlug = new Map(
    (await prisma.product.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]),
  );
  let reviewCount = 0;
  for (const [handle, reviews] of Object.entries(reviewsByHandle)) {
    const productId = productBySlug.get(handle);
    if (!productId) continue;
    for (const r of reviews) {
      await prisma.review.create({
        data: {
          productId,
          customerName: r.author || "Verified Buyer",
          rating: Math.min(5, Math.max(1, r.rating || 5)),
          title: r.title,
          body: r.body,
          status: "approved",
        },
      });
      reviewCount++;
    }
    // keep product.rating / reviewCount in sync with the real reviews
    const agg = await prisma.review.aggregate({
      where: { productId, status: "approved" },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: agg._count._all ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : null,
        reviewCount: agg._count._all,
      },
    });
  }
  console.log(`   • ${reviewCount} real reviews imported (${Object.keys(reviewsByHandle).length} products)`);

  // sample customers + orders (reference real products)
  const customers = await Promise.all(
    [
      { name: "Ayesha Khan", email: "ayesha@example.com", phone: "+92 300 1234567", city: "Lahore", address: "DHA Phase 5, Lahore" },
      { name: "Bilal Ahmed", email: "bilal@example.com", phone: "+92 321 7654321", city: "Karachi", address: "Clifton Block 4, Karachi" },
      { name: "Sana Malik", email: "sana@example.com", phone: "+92 333 2223344", city: "Islamabad", address: "F-7 Markaz, Islamabad" },
    ].map((c) => prisma.customer.create({ data: c })),
  );

  const allProducts = await prisma.product.findMany({ include: { variants: true }, take: 30 });
  const pick = (i: number) => allProducts[i % allProducts.length];
  const sampleOrders = [
    { orderNumber: 1001, customer: customers[0], paymentMethod: "cod", paymentStatus: "pending", fulfillmentStatus: "unfulfilled", lines: [{ p: pick(0), qty: 2 }, { p: pick(7), qty: 1 }] },
    { orderNumber: 1002, customer: customers[1], paymentMethod: "jazzcash", paymentStatus: "paid", fulfillmentStatus: "fulfilled", courier: "ZoomCOD", trackingNumber: "ZC-0001002", lines: [{ p: pick(3), qty: 3 }] },
    { orderNumber: 1003, customer: customers[2], paymentMethod: "easypaisa", paymentStatus: "paid", fulfillmentStatus: "unfulfilled", lines: [{ p: pick(12), qty: 4 }, { p: pick(1), qty: 1 }] },
  ];
  for (const o of sampleOrders) {
    const items = o.lines.map((l) => {
      const price = l.p.variants[0]?.price ?? l.p.price;
      return { productId: l.p.id, title: l.p.title, variantTitle: l.p.variants[0]?.title ?? "", quantity: l.qty, price, total: price * l.qty };
    });
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const shipping = subtotal >= 7000 ? 0 : 250;
    await prisma.order.create({
      data: {
        orderNumber: o.orderNumber,
        customerId: o.customer.id,
        customerName: o.customer.name,
        email: o.customer.email,
        phone: o.customer.phone,
        address: o.customer.address,
        city: o.customer.city,
        subtotal,
        shipping,
        total: subtotal + shipping,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        courier: o.courier ?? "",
        trackingNumber: o.trackingNumber ?? "",
        items: { create: items },
      },
    });
  }
  console.log(`   • ${customers.length} customers, ${sampleOrders.length} orders`);

  // posts
  for (const post of seedPosts) await prisma.post.create({ data: post });
  console.log(`   • ${seedPosts.length} blog posts`);

  // discounts
  await prisma.discount.createMany({
    data: [
      { code: "WELCOME20", type: "percentage", value: 20, minSubtotal: 0 },
      { code: "FREESHIP", type: "free_shipping", value: 0, minSubtotal: 3000 },
      { code: "EGF500", type: "fixed", value: 500, minSubtotal: 5000 },
    ],
  });

  // weight-based shipping rate bands
  await prisma.shippingRate.deleteMany();
  await prisma.shippingRate.createMany({
    data: [
      { label: "Up to 500g", minGrams: 0, maxGrams: 500, rate: 150, sortOrder: 0 },
      { label: "500g to 1kg", minGrams: 500, maxGrams: 1000, rate: 200, sortOrder: 1 },
      { label: "1kg to 3kg", minGrams: 1000, maxGrams: 3000, rate: 280, sortOrder: 2 },
      { label: "3kg and above", minGrams: 3000, maxGrams: null, rate: 400, sortOrder: 3 },
    ],
  });

  // settings
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.create({ data: { key, value } });
  }
  const featured = await prisma.product.count({ where: { isFeatured: true } });
  console.log(`   • ${Object.keys(defaultSettings).length} settings, 3 discounts, 4 shipping bands`);
  console.log(`   • ${featured} products featured on homepage`);
  console.log("✅  Import complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
