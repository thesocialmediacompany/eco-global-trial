/**
 * Seeds wave-2 dummy content: HORECA collection, category descriptions,
 * gallery placeholders, and downloadable catalog PDFs (generated as small
 * valid placeholder files in public/catalogs). Idempotent-ish: skips gallery/
 * catalog seeding if rows already exist.
 */
import { PrismaClient } from "@prisma/client";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

/** Build a minimal, valid single-page PDF with a centered title. */
function buildPdf(title: string): Buffer {
  const esc = (s: string) => s.replace(/([()\\])/g, "\\$1");
  const lines = [
    `BT /F1 22 Tf 70 720 Td (${esc(title)}) Tj ET`,
    `BT /F1 12 Tf 70 690 Td (Eco Global Foods - sample catalog placeholder) Tj ET`,
    `BT /F1 12 Tf 70 672 Td (Replace this with your real catalog PDF from the admin.) Tj ET`,
  ].join("\n");
  const stream = `<< /Length ${Buffer.byteLength(lines)} >>\nstream\n${lines}\nendstream`;

  const objs = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    stream,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const CATEGORY_COPY: Record<string, { tagline: string; description: string }> = {
  "granola-cereals": {
    tagline: "Crunchy, wholesome mornings",
    description:
      "Whole-grain granola and breakfast cereals baked for real crunch and lasting energy. No artificial colours or unnecessary additives, just honest ingredients to start your day right.",
  },
  "oats-family": {
    tagline: "Ready in minutes",
    description:
      "Instant and rolled oats and barley, high in fibre to keep you full for longer. A quick, naturally nourishing base for breakfast bowls, bakes and smoothies.",
  },
  "morning-essentials": {
    tagline: "Start the day right",
    description:
      "Wholesome breakfast essentials, from muesli to morning mixes, for an energising and balanced start. Thoughtfully made for busy mornings.",
  },
  "flours-flours": {
    tagline: "From farm to flour",
    description:
      "Naturally milled flours for wholesome home cooking and baking. Carefully sourced grains, milled to preserve nutrition and flavour.",
  },
  "baking-products": {
    tagline: "Bake with goodness",
    description:
      "Natural baking essentials for delicious, wholesome treats, without the artificial extras. Everything you need for happy home baking.",
  },
  "spices-spices": {
    tagline: "Authentic, pure blends",
    description:
      "Pure spices and masalas with no artificial colours or fillers. Authentic aroma and flavour, ground for everyday Pakistani cooking.",
  },
  herbs: {
    tagline: "Wellness from the earth",
    description:
      "Carefully sourced natural herbs for cooking and wellness. Clean, simple and full of character.",
  },
  "seeds-grains": {
    tagline: "Nature's tiny powerhouses",
    description:
      "Nutrient-dense seeds and whole grains for a balanced lifestyle, from chia and flax to quinoa. Small additions with a big nutritional punch.",
  },
  "dry-fruits": {
    tagline: "Premium, hand-picked",
    description:
      "Hand-picked premium dry fruits and nuts, sealed for freshness. A naturally satisfying snack and a wholesome cooking companion.",
  },
  "gluten-free": {
    tagline: "Pure & worry-free",
    description:
      "A dedicated gluten-free range for sensitive diets, made without compromising on taste. Enjoy the foods you love with peace of mind.",
  },
  "batter-marination": {
    tagline: "Restaurant taste at home",
    description:
      "Ready batter and marination mixes for crispy, flavourful meals in minutes. Bring restaurant-style results to your kitchen.",
  },
  "dehydrated-dehydrated": {
    tagline: "Flavour, locked in",
    description:
      "Dehydrated vegetables and foods that lock in nutrition and flavour with a long shelf life. Convenience without the compromise.",
  },
  horeca: {
    tagline: "Wholesale packs for business",
    description:
      "Bulk and foodservice packs built for hotels, restaurants, caterers and retailers. Consistent quality, efficient pack sizes, and private-label options, all backed by our ISO 22000, HACCP and Halal certified manufacturing.",
  },
};

const GALLERY: { caption: string; emoji: string; gradient: string; featured: boolean; productSlug?: string }[] = [
  { caption: "Golden granola, fresh from the oven", emoji: "🥣", gradient: "gradient-purple", featured: true, productSlug: "granola-chocolate-cereals" },
  { caption: "Naturally milled flour", emoji: "🌾", gradient: "gradient-green", featured: true, productSlug: "eco-purpose-flour" },
  { caption: "Rolled oats, ready in minutes", emoji: "🥡", gradient: "gradient-purple-green", featured: true, productSlug: "rolled-oats" },
  { caption: "Hand-picked seeds & grains", emoji: "🌱", gradient: "gradient-green", featured: true, productSlug: "eco-chia-seed-imported" },
  { caption: "A warm bowl, made from our range", emoji: "🍲", gradient: "gradient-purple", featured: true, productSlug: "muesli-swiss-style" },
  { caption: "Premium dry fruits & nuts", emoji: "🥜", gradient: "gradient-purple-green", featured: true, productSlug: "eco-raisins" },
  { caption: "Freshly baked with our flours", emoji: "🍞", gradient: "gradient-green", featured: false, productSlug: "eco-purpose-flour" },
  { caption: "Natural spices, ground fresh", emoji: "🌶️", gradient: "gradient-purple", featured: false },
];

const CATALOGS = [
  { title: "Retail Range Catalog 2026", description: "Our complete retail product range.", file: "retail-range-2026.pdf" },
  { title: "Bulk & HORECA Catalog", description: "Foodservice and wholesale pack sizes.", file: "bulk-horeca.pdf" },
  { title: "Private Label Capabilities", description: "Custom and private-label manufacturing.", file: "private-label.pdf" },
];

async function main() {
  // 1) HORECA collection (create if missing)
  const horecaCopy = CATEGORY_COPY.horeca;
  await prisma.collection.upsert({
    where: { slug: "horeca" },
    update: {},
    create: {
      slug: "horeca",
      name: "HORECA",
      tagline: horecaCopy.tagline,
      description: horecaCopy.description,
      emoji: "🏢",
      gradient: "gradient-purple-green",
      sortOrder: 99,
      seoTitle: "HORECA",
      seoDescription: horecaCopy.description.slice(0, 155),
    },
  });

  // 2) Category descriptions + taglines for all known collections
  let updated = 0;
  for (const [slug, copy] of Object.entries(CATEGORY_COPY)) {
    const res = await prisma.collection.updateMany({
      where: { slug },
      data: { description: copy.description, tagline: copy.tagline },
    });
    updated += res.count;
  }
  console.log(`Updated descriptions on ${updated} collections`);

  // 3) Gallery placeholders (only if empty)
  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: GALLERY.map((g, i) => ({ ...g, sortOrder: i })),
    });
    console.log(`Seeded ${GALLERY.length} gallery placeholders`);
  } else {
    console.log(`Gallery already has ${galleryCount} rows, skipping`);
  }

  // 4) Catalog PDFs (only if empty) — generate placeholder files
  const catCount = await prisma.catalogFile.count();
  if (catCount === 0) {
    const dir = join(process.cwd(), "public", "catalogs");
    mkdirSync(dir, { recursive: true });
    const rows = CATALOGS.map((c, i) => {
      const pdf = buildPdf(c.title);
      writeFileSync(join(dir, c.file), pdf);
      const sizeLabel = `${Math.max(1, Math.round(pdf.length / 1024))} KB`;
      return {
        title: c.title,
        description: c.description,
        fileUrl: `/catalogs/${c.file}`,
        sizeLabel,
        sortOrder: i,
      };
    });
    await prisma.catalogFile.createMany({ data: rows });
    console.log(`Seeded ${rows.length} catalog PDFs`);
  } else {
    console.log(`Catalogs already has ${catCount} rows, skipping`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
