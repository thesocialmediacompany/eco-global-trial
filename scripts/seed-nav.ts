/** Seeds the editable navigation links (header + footer columns) with the
 * current hard-coded menus. Idempotent: only seeds a location if it's empty. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HEADER = [
  { label: "Shop", href: "/shop", mega: true },
  { label: "HORECA", href: "/category/horeca" },
  { label: "Bundles", href: "/bundles" },
  { label: "Recipes", href: "/recipes" },
  { label: "Our Story", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const FOOTER_SHOP = [
  { label: "Granola & Cereal", href: "/category/granola-cereals" },
  { label: "Oats Family", href: "/category/oats-family" },
  { label: "Morning Essentials", href: "/category/morning-essentials" },
  { label: "Flours", href: "/category/flours-flours" },
  { label: "Baking Products", href: "/category/baking-products" },
  { label: "Spices", href: "/category/spices-spices" },
  { label: "Cereals", href: "/category/granola-cereals" },
  { label: "HORECA", href: "/category/horeca" },
  { label: "Special offers", href: "/sale" },
  { label: "All products", href: "/shop" },
];

const FOOTER_COMPANY = [
  { label: "Our Story", href: "/about" },
  { label: "Stores available at", href: "/stores" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Track order", href: "/track" },
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns", href: "/policies/refund" },
];

async function seed(location: string, links: { label: string; href: string; mega?: boolean }[]) {
  const existing = await prisma.navLink.count({ where: { location } });
  if (existing > 0) {
    console.log(`${location}: ${existing} links already, skipping`);
    return;
  }
  await prisma.navLink.createMany({
    data: links.map((l, i) => ({
      location,
      label: l.label,
      href: l.href,
      mega: l.mega ?? false,
      sortOrder: i,
    })),
  });
  console.log(`${location}: seeded ${links.length} links`);
}

async function main() {
  await seed("header", HEADER);
  await seed("footer_shop", FOOTER_SHOP);
  await seed("footer_company", FOOTER_COMPANY);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
