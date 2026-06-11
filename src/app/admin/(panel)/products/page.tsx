import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      collection: true,
      variants: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">Products</h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {products.length} products
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream shadow-sm transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Collection</th>
                <th className="px-5 py-3 font-medium">Inventory</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const inventory = p.variants.reduce((s, v) => s + v.inventoryQty, 0);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-purple-50 last:border-0 hover:bg-cream/40"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-3"
                      >
                        <span
                          className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg text-xl ${
                            p.imageUrl ? "bg-white" : p.gradient
                          }`}
                        >
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.title} fill sizes="40px" className="object-cover" />
                          ) : (
                            p.emoji
                          )}
                        </span>
                        <span>
                          <span className="block font-medium text-purple-900 hover:text-purple-700">
                            {p.isFeatured && (
                              <span title="Featured on homepage" className="mr-1">
                                ⭐
                              </span>
                            )}
                            {p.title}
                          </span>
                          <span className="text-xs text-purple-900/50">
                            {p.variants.length} variant
                            {p.variants.length === 1 ? "" : "s"}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 text-purple-900/80">
                      {p.collection?.name ?? " - "}
                    </td>
                    <td className="px-5 py-3 text-purple-900/80">
                      {inventory} in stock
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-purple-900">
                      {formatPKR(p.price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
