import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds the About page grids from the copy that used to be hardcoded in
 * src/app/(store)/about/page.tsx. Idempotent: skips if items already exist.
 */
const ITEMS: { grid: string; icon?: string; year?: string; title: string; body: string }[] = [
  // values
  { grid: "values", icon: "Sprout", title: "Natural & Pure", body: "Good natural ingredients, never artificial flavours or additives." },
  { grid: "values", icon: "Target", title: "Innovation", body: "Technology and knowledge applied to advance food processing and value." },
  { grid: "values", icon: "Heart", title: "Well-being", body: "Food that is delicious and thoughtfully made for active, balanced living." },
  { grid: "values", icon: "Eye", title: "Quality", body: "The highest standards of quality, safety and satisfaction in every batch." },
  // certifications
  { grid: "certifications", icon: "ShieldCheck", title: "ISO 22000 & HACCP", body: "Food safety and quality management systems." },
  { grid: "certifications", icon: "BadgeCheck", title: "Halal & Organic", body: "Certified Halal and organic production." },
  { grid: "certifications", icon: "Leaf", title: "ISO 14001", body: "Environmental management systems." },
  { grid: "certifications", icon: "Globe2", title: "International Standards", body: "Aligned with global food industry benchmarks." },
  { grid: "certifications", icon: "Landmark", title: "PSQCA & Food Authority", body: "Regulatory approvals, verified by the Pakistan Food Authority." },
  // quality policy
  { grid: "quality", icon: "Award", title: "Customer Satisfaction", body: "We prioritise our customers' needs, aim to exceed expectations with every product, and actively seek feedback to keep improving." },
  { grid: "quality", icon: "Scale", title: "Compliance", body: "We adhere to all relevant regulatory requirements, industry standards and internal quality controls for safe, legal, honest products." },
  { grid: "quality", icon: "TrendingUp", title: "Continuous Improvement", body: "Our people look for ways to do better at every stage of production, from sourcing to packing." },
  { grid: "quality", icon: "GraduationCap", title: "Training & Development", body: "We invest in our employees' skills, knowledge and resources so they can uphold our quality standards." },
  { grid: "quality", icon: "Handshake", title: "Supplier Relationships", body: "Close collaboration with suppliers ensures the quality and consistency of every raw material and ingredient." },
  { grid: "quality", icon: "Recycle", title: "Environmental Responsibility", body: "We work to cut waste, save energy and use resources responsibly across the business." },
  // packaging
  { grid: "packaging", icon: "Package2", title: "Bulk Loose Packing", body: "Ideal for commercial use." },
  { grid: "packaging", icon: "Box", title: "Non-Branded Consumer Pack", body: "Standard packaging suitable for various retail outlets." },
  { grid: "packaging", icon: "Store", title: "Own Brand Bulk Pack", body: "Customised packaging for major retailers (Hyperstar, Metro)." },
  { grid: "packaging", icon: "ShoppingBag", title: "Own Brand Consumer Pack", body: "Consumer-friendly retail packaging (Hyperstar, Metro)." },
  // timeline
  { grid: "timeline", year: "1999", title: "The beginning", body: "Eco Global Foods is founded with a commitment to high-quality food products." },
  { grid: "timeline", year: "2010", title: "Growing range", body: "Expansion across spices, flours, seeds and natural pantry staples." },
  { grid: "timeline", year: "2020", title: "Modern living", body: "Focus shifts to wholesome, convenient foods for modern lifestyles." },
  { grid: "timeline", year: "Today", title: "A new range", body: "Granola, oats, malted drinks and protein bars for the way people eat now." },
];

async function wake() {
  for (let i = 0; i < 8; i++) {
    try { await prisma.$queryRaw`select 1`; return; } catch { await new Promise((r) => setTimeout(r, 4000)); }
  }
}

async function main() {
  await wake();
  const existing = await prisma.aboutItem.count();
  if (existing > 0) {
    console.log(`AboutItem already has ${existing} rows - skipping seed.`);
    return;
  }
  const perGrid: Record<string, number> = {};
  for (const it of ITEMS) {
    const sortOrder = perGrid[it.grid] = (perGrid[it.grid] ?? -1) + 1;
    await prisma.aboutItem.create({
      data: {
        grid: it.grid,
        icon: it.icon ?? "",
        year: it.year ?? "",
        title: it.title,
        body: it.body,
        sortOrder,
        active: true,
      },
    });
  }
  const counts = await prisma.aboutItem.groupBy({ by: ["grid"], _count: true });
  console.log("seeded:", counts.map((c) => `${c.grid}=${c._count}`).join(", "), `(total ${ITEMS.length})`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
