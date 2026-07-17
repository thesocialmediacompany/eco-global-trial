import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { InventoryTable, type InvRow } from "@/components/admin/InventoryTable";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
          { collection: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  // Totals always reflect the WHOLE catalogue, not just the filtered view.
  const [products, unitsAgg, lowStock, outOfStock] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { title: "asc" },
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.variant.aggregate({ _sum: { inventoryQty: true } }),
    prisma.variant.count({ where: { inventoryQty: { gt: 0, lte: 10 } } }),
    prisma.variant.count({ where: { inventoryQty: 0 } }),
  ]);

  const rows: InvRow[] = products.flatMap((p) =>
    p.variants.map((v, i) => ({
      id: v.id,
      qty: v.inventoryQty,
      variantTitle: v.title,
      sku: v.sku || "",
      productTitle: p.title,
      imageUrl: p.imageUrl || "",
      emoji: p.emoji,
      gradient: p.gradient,
      first: i === 0,
    })),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">Inventory</h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {(unitsAgg._sum.inventoryQty ?? 0).toLocaleString()} units · {lowStock} low ·{" "}
            {outOfStock} out of stock
            {q ? ` · showing ${rows.length} matching “${q}”` : ""}
          </p>
        </div>
        <AdminSearch defaultValue={q} placeholder="Search product or SKU…" />
      </div>

      <InventoryTable rows={rows} />
    </div>
  );
}
