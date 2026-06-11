import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories } from "../src/data/categories";
import { products } from "../src/data/products";
import { seedPosts } from "../src/data/posts";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding Eco Global Foods database…");

  // Clean slate (order matters for FKs)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staffUser.deleteMany();
  await prisma.post.deleteMany();
  await prisma.discount.deleteMany();

  // ── Staff (demo owner) ───────────────────────────────────────────
  await prisma.staffUser.create({
    data: {
      email: "admin@ecoglobalfoods.com",
      name: "EGF Admin",
      passwordHash: await bcrypt.hash("ecoadmin123", 10),
      role: "owner",
    },
  });
  console.log("   • staff: admin@ecoglobalfoods.com / ecoadmin123");

  // ── Collections (categories) ─────────────────────────────────────
  const collectionIdBySlug = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const created = await prisma.collection.create({
      data: {
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        description: c.seo.description,
        emoji: c.emoji,
        gradient: c.gradient,
        isNew: c.isNew ?? false,
        sortOrder: i,
        seoTitle: c.seo.title,
        seoDescription: c.seo.description,
        seoKeywords: c.seo.keywords.join(", "),
      },
    });
    collectionIdBySlug.set(c.slug, created.id);
  }
  console.log(`   • ${categories.length} collections`);

  // ── Products + variants ──────────────────────────────────────────
  for (const p of products) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.name,
        tagline: p.tagline,
        description: p.description,
        status: "active",
        emoji: p.emoji,
        gradient: p.gradient,
        badges: (p.badges ?? []).join(", "),
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        isNew: p.isNew ?? false,
        isBestseller: p.isBestseller ?? false,
        rating: p.rating ?? null,
        reviewCount: p.reviewCount ?? 0,
        seoTitle: p.seo.title,
        seoDescription: p.seo.description,
        seoKeywords: p.seo.keywords.join(", "),
        collectionId: collectionIdBySlug.get(p.category) ?? null,
        variants: {
          create: (p.flavours ?? ["Default"]).map((flavour, idx) => ({
            title: flavour,
            sku: `${p.slug}-${flavour.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            inventoryQty: 100,
            sortOrder: idx,
          })),
        },
      },
    });
  }
  console.log(`   • ${products.length} products (with flavour variants)`);

  // ── Sample customers ─────────────────────────────────────────────
  const customers = await Promise.all(
    [
      { name: "Ayesha Khan", email: "ayesha@example.com", phone: "+92 300 1234567", city: "Lahore", address: "DHA Phase 5, Lahore" },
      { name: "Bilal Ahmed", email: "bilal@example.com", phone: "+92 321 7654321", city: "Karachi", address: "Clifton Block 4, Karachi" },
      { name: "Sana Malik", email: "sana@example.com", phone: "+92 333 2223344", city: "Islamabad", address: "F-7 Markaz, Islamabad" },
    ].map((c) => prisma.customer.create({ data: c })),
  );

  // ── Sample orders ────────────────────────────────────────────────
  const allProducts = await prisma.product.findMany({ include: { variants: true } });
  const pick = (i: number) => allProducts[i % allProducts.length];

  const sampleOrders = [
    {
      orderNumber: 1001,
      customer: customers[0],
      paymentMethod: "cod",
      paymentStatus: "pending",
      fulfillmentStatus: "unfulfilled",
      lines: [
        { p: pick(0), qty: 2 },
        { p: pick(7), qty: 1 },
      ],
    },
    {
      orderNumber: 1002,
      customer: customers[1],
      paymentMethod: "jazzcash",
      paymentStatus: "paid",
      fulfillmentStatus: "fulfilled",
      courier: "ZoomCOD",
      trackingNumber: "ZC-784512369",
      lines: [{ p: pick(3), qty: 3 }],
    },
    {
      orderNumber: 1003,
      customer: customers[2],
      paymentMethod: "easypaisa",
      paymentStatus: "paid",
      fulfillmentStatus: "unfulfilled",
      lines: [
        { p: pick(12), qty: 4 },
        { p: pick(1), qty: 1 },
      ],
    },
  ];

  for (const o of sampleOrders) {
    const items = o.lines.map((l) => {
      const price = l.p.variants[0]?.price ?? l.p.price;
      return {
        productId: l.p.id,
        title: l.p.title,
        variantTitle: l.p.variants[0]?.title ?? "",
        quantity: l.qty,
        price,
        total: price * l.qty,
      };
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

  // ── Blog posts ───────────────────────────────────────────────────
  for (const p of seedPosts) {
    await prisma.post.create({ data: p });
  }
  console.log(`   • ${seedPosts.length} blog posts`);

  // ── Discounts ────────────────────────────────────────────────────
  await prisma.discount.createMany({
    data: [
      { code: "WELCOME20", type: "percentage", value: 20, minSubtotal: 0 },
      { code: "FREESHIP", type: "free_shipping", value: 0, minSubtotal: 3000 },
      { code: "EGF500", type: "fixed", value: 500, minSubtotal: 5000 },
    ],
  });
  console.log("   • 3 discount codes");

  console.log("✅  Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
