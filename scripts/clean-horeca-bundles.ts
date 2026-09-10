import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * One-off cleanup: remove HORECA (B2B/bulk) products from existing bundles.
 *
 * Going forward this is prevented in code (admin picker hides HORECA, and
 * createBundle/updateBundle strip it on save). This script fixes bundles that
 * already held a HORECA member before that shipped, without opening each one.
 *
 *   Dry run (default — reports, changes nothing):
 *     npx tsx scripts/clean-horeca-bundles.ts
 *   Apply the changes:
 *     npx tsx scripts/clean-horeca-bundles.ts --apply
 *
 * After --apply, bundle pages refresh on their normal ISR revalidation (or the
 * next deploy). Safe to run repeatedly — a second run finds nothing to do.
 */

// Mirrors HIDDEN_COLLECTION_SLUGS in src/lib/products.ts (kept in sync there).
const HIDDEN_COLLECTION_SLUGS = ["horeca"];

const APPLY = process.argv.includes("--apply");

/** Neon scales to zero; retry until the first query succeeds. */
async function wake() {
  for (let i = 0; i < 8; i++) {
    try { await prisma.$queryRaw`select 1`; return; }
    catch { console.log("waking Neon...", i); await new Promise((r) => setTimeout(r, 5000)); }
  }
}

async function main() {
  await wake();

  // 1. Every product that is in a hidden collection (HORECA), by primary
  //    collection OR an additional collection link.
  const horeca = await prisma.product.findMany({
    where: {
      OR: HIDDEN_COLLECTION_SLUGS.flatMap((slug) => [
        { collection: { slug } },
        { collectionLinks: { some: { collection: { slug } } } },
      ]),
    },
    select: { id: true, title: true },
  });
  const horecaIds = horeca.map((p) => p.id);
  console.log(`HORECA products found: ${horecaIds.length}`);
  if (horecaIds.length === 0) {
    console.log("Nothing to do — no HORECA products exist.");
    return;
  }

  // 2. Bundle lines that reference a HORECA product.
  const badItems = await prisma.bundleItem.findMany({
    where: { productId: { in: horecaIds } },
    include: {
      bundle: { select: { id: true, title: true, slug: true, price: true } },
      product: { select: { title: true } },
    },
  });

  if (badItems.length === 0) {
    console.log("No bundles contain HORECA products. Nothing to clean.");
    return;
  }

  // 3. Group the offending lines by bundle for a readable report.
  const byBundle = new Map<string, { title: string; slug: string; price: number; members: string[] }>();
  for (const it of badItems) {
    const e = byBundle.get(it.bundle.id) ?? {
      title: it.bundle.title, slug: it.bundle.slug, price: it.bundle.price, members: [],
    };
    e.members.push(`${it.product.title} ×${it.quantity}`);
    byBundle.set(it.bundle.id, e);
  }

  console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — ${badItems.length} HORECA line(s) across ${byBundle.size} bundle(s):`);
  for (const [id, b] of byBundle) {
    console.log(`  • "${b.title}" (/bundles/${b.slug}) [${id}]`);
    for (const m of b.members) console.log(`      – remove: ${m}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to make these changes.");
    return;
  }

  // 4. Delete the offending lines, then recompute each affected bundle's
  //    compare-at price from its REMAINING contents (same rule as the app:
  //    compareAtPrice = contents value when it beats the bundle price, else
  //    null). Bundle price itself is left untouched.
  const del = await prisma.bundleItem.deleteMany({ where: { productId: { in: horecaIds } } });
  console.log(`\nDeleted ${del.count} bundle line(s).`);

  for (const [bundleId, b] of byBundle) {
    const remaining = await prisma.bundleItem.findMany({
      where: { bundleId },
      include: { product: { select: { price: true } } },
    });
    const value = remaining.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
    await prisma.product.update({
      where: { id: bundleId },
      data: { compareAtPrice: value > b.price ? value : null },
    });
    const note =
      remaining.length === 0
        ? "  ⚠️  now EMPTY — review this bundle (consider archiving it)."
        : `  recomputed value Rs ${value} (${remaining.length} member(s) left).`;
    console.log(`  • "${b.title}":${note}`);
  }

  console.log("\nDone. Bundle pages refresh on their next ISR revalidation or deploy.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
