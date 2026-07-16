import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Lightweight typeahead for the search box: returns up to 6 product matches. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const rows = await prisma.product.findMany({
    where: {
      status: "active",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { badges: { contains: q, mode: "insensitive" } },
        { collection: { is: { name: { contains: q, mode: "insensitive" } } } },
      ],
    },
    select: {
      slug: true,
      title: true,
      price: true,
      emoji: true,
      imageUrl: true,
      isBestseller: true,
    },
    take: 24,
  });

  // Rank: title match first (and word-start over mid-word), then bestsellers.
  const ql = q.toLowerCase();
  const score = (r: (typeof rows)[number]) => {
    const t = r.title.toLowerCase();
    let s = 0;
    if (t.startsWith(ql)) s += 4;
    else if (t.includes(ql)) s += 3;
    if (r.isBestseller) s += 1;
    return s;
  };
  const ranked = rows
    .sort((a, b) => score(b) - score(a))
    .slice(0, 6);

  return NextResponse.json({
    results: ranked.map((r) => ({
      slug: r.slug,
      title: r.title,
      price: r.price,
      emoji: r.emoji,
      imageUrl: r.imageUrl || null,
    })),
  });
}
