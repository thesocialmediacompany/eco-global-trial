import Link from "next/link";
import Image from "next/image";
import { Plus, Gift } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function BundlesPage() {
  const bundles = await prisma.product.findMany({
    where: { isBundle: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bundleItems: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-purple-900">
            <Gift className="h-6 w-6 text-green-600" /> Bundles
          </h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {bundles.length} bundles · curated multi-product combos
          </p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="inline-flex items-center gap-2 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Create bundle
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
              <th className="px-5 py-3 font-medium">Bundle</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Products</th>
              <th className="px-5 py-3 text-right font-medium">Price</th>
              <th className="px-5 py-3 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {bundles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-purple-900/50">
                  No bundles yet - create your first combo.
                </td>
              </tr>
            ) : (
              bundles.map((b) => (
                <tr key={b.id} className="border-b border-purple-50 last:border-0 hover:bg-cream/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/bundles/${b.id}`} className="flex items-center gap-3">
                      <span className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg text-xl ${b.imageUrl ? "bg-white" : b.gradient}`}>
                        {b.imageUrl ? (
                          <Image src={b.imageUrl} alt={b.title} fill sizes="40px" className="object-cover" />
                        ) : (
                          b.emoji
                        )}
                      </span>
                      <span className="font-medium text-purple-900 hover:text-purple-700">{b.title}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-3 text-purple-900/70">{b._count.bundleItems} products</td>
                  <td className="px-5 py-3 text-right font-medium text-purple-900">{formatPKR(b.price)}</td>
                  <td className="px-5 py-3 text-right text-purple-900/50 line-through">
                    {b.compareAtPrice ? formatPKR(b.compareAtPrice) : " - "}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
