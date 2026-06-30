/** Demo setup for page covers: photo sliders on HORECA + Bundles (real product
 * images), an animated running gradient on Home, a fresh gradient on Recipes. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function imagesFor(slugs: string[], fallbackCount: number): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { slug: { in: slugs }, imageUrl: { not: "" } },
    select: { slug: true, imageUrl: true },
  });
  const map = new Map(rows.map((r) => [r.slug, r.imageUrl]));
  let imgs = slugs.map((s) => map.get(s)).filter((u): u is string => !!u);
  if (imgs.length < 2) {
    const extra = await prisma.product.findMany({
      where: { status: "active", imageUrl: { not: "" } },
      select: { imageUrl: true },
      take: fallbackCount,
      orderBy: { title: "asc" },
    });
    imgs = extra.map((e) => e.imageUrl);
  }
  return imgs.slice(0, 5);
}

async function setCover(pageKey: string, data: Partial<{
  mode: string; gradient: string; animated: boolean; images: string; autoplayMs: number;
}>) {
  await prisma.pageHero.upsert({
    where: { pageKey },
    update: data,
    create: {
      pageKey,
      mode: data.mode ?? "gradient",
      gradient: data.gradient ?? "gradient-purple-green",
      animated: data.animated ?? false,
      images: data.images ?? "",
      autoplayMs: data.autoplayMs ?? 5000,
    },
  });
}

async function main() {
  const horeca = await imagesFor(
    ["eco-purpose-flour", "rolled-oats", "eco-rolled-wheat", "eco-chia-seed-imported"],
    4,
  );
  const bundles = await imagesFor(
    ["granola-chocolate-cereals", "muesli-swiss-style", "eco-raisins", "rolled-oats"],
    4,
  );

  await setCover("home", { mode: "gradient", gradient: "gradient-purple-green", animated: true });
  await setCover("recipes", { mode: "gradient", gradient: "gradient-sunset", animated: false });
  await setCover("horeca", { mode: "slider", images: horeca.join(","), autoplayMs: 5000 });
  await setCover("bundles", { mode: "slider", images: bundles.join(","), autoplayMs: 4500 });

  console.log("home: animated purple-green gradient");
  console.log("recipes: sunset gradient");
  console.log(`horeca: slider with ${horeca.length} images`);
  console.log(`bundles: slider with ${bundles.length} images`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
