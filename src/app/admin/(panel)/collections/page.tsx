import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">Collections</h1>
          <p className="mt-1 text-sm text-purple-900/60">{collections.length} collections</p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Add collection
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
              <th className="px-5 py-3 font-medium">Collection</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Products</th>
              <th className="px-5 py-3 font-medium">Order</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b border-purple-50 last:border-0 hover:bg-cream/40">
                <td className="px-5 py-3">
                  <Link href={`/admin/collections/${c.id}`} className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-lg text-xl ${c.gradient}`}>
                      {c.emoji}
                    </span>
                    <span className="font-medium text-purple-900 hover:text-purple-700">{c.name}</span>
                  </Link>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-purple-900/60">{c.slug}</td>
                <td className="px-5 py-3 text-purple-900/70">{c._count.products}</td>
                <td className="px-5 py-3 text-purple-900/70">{c.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
