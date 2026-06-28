import Link from "next/link";
import { Plus, Trash2, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { addExistingToHoreca, removeFromHoreca } from "./actions";

export default async function HorecaAdminPage() {
  const collection = await prisma.collection.findUnique({
    where: { slug: "horeca" },
    select: { id: true, name: true },
  });

  const all = await prisma.product.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, price: true, status: true, imageUrl: true, emoji: true, collectionId: true },
  });

  const inHoreca = collection ? all.filter((p) => p.collectionId === collection.id) : [];
  const others = collection ? all.filter((p) => p.collectionId !== collection.id) : all;

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-purple-900">
            <Building2 className="h-6 w-6 text-green-600" /> HORECA products
          </h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {inHoreca.length} product{inHoreca.length === 1 ? "" : "s"} in the HORECA category.
            These appear on{" "}
            <Link href="/category/horeca" className="text-green-700 hover:underline">
              /category/horeca
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/horeca/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Add HORECA product
        </Link>
      </div>

      {!collection && (
        <p className="rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm text-rose-700">
          The HORECA category is missing. Re-run the seed or create a collection with slug
          <code className="mx-1">horeca</code>.
        </p>
      )}

      {/* Add an existing product */}
      {collection && others.length > 0 && (
        <form
          action={addExistingToHoreca}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-purple-200 bg-cream/30 p-4"
        >
          <label className="block min-w-0 flex-1">
            <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
              Add an existing product to HORECA
            </span>
            <select name="productId" required className={input} defaultValue="">
              <option value="" disabled>
                Choose a product…
              </option>
              {others.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
            Add to HORECA
          </button>
        </form>
      )}

      {/* Current HORECA products */}
      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        {inHoreca.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="mx-auto h-8 w-8 text-purple-900/30" />
            <p className="mt-3 text-sm text-purple-900/60">
              No HORECA products yet. Click <strong>Add HORECA product</strong> to create one,
              or add an existing product above.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inHoreca.map((p) => (
                <tr key={p.id} className="border-b border-purple-50 last:border-0 hover:bg-cream/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-cream text-xl">
                          {p.emoji}
                        </span>
                      )}
                      <span className="font-medium text-purple-900 hover:text-purple-700">{p.title}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-purple-900/70">{formatPKR(p.price)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        p.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        Edit
                      </Link>
                      <form action={removeFromHoreca.bind(null, p.id)}>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
                          aria-label="Remove from HORECA"
                          title="Remove from HORECA"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";
