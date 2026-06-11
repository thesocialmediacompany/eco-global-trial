import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { updateInventory } from "./actions";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { title: "asc" },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });

  const totalUnits = products.reduce(
    (s, p) => s + p.variants.reduce((a, v) => a + v.inventoryQty, 0),
    0,
  );
  const lowStock = products
    .flatMap((p) => p.variants)
    .filter((v) => v.inventoryQty > 0 && v.inventoryQty <= 10).length;
  const outOfStock = products.flatMap((p) => p.variants).filter((v) => v.inventoryQty === 0).length;

  return (
    <form action={updateInventory} className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">Inventory</h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {totalUnits.toLocaleString()} units · {lowStock} low · {outOfStock} out of stock
          </p>
        </div>
        <button className="rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream">
          Save changes
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Variant</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 text-right font-medium">In stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) =>
              p.variants.map((v, i) => (
                <tr key={v.id} className="border-b border-purple-50 last:border-0 hover:bg-cream/40">
                  <td className="px-5 py-2.5">
                    {i === 0 && (
                      <div className="flex items-center gap-2.5">
                        <span className={`relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md text-base ${p.imageUrl ? "bg-white" : p.gradient}`}>
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.title} fill sizes="32px" className="object-cover" />
                          ) : (
                            p.emoji
                          )}
                        </span>
                        <span className="font-medium text-purple-900">{p.title}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-purple-900/70">{v.title}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-purple-900/50">{v.sku || " - "}</td>
                  <td className="px-5 py-2.5 text-right">
                    <input
                      name={`qty:${v.id}`}
                      type="number"
                      min={0}
                      defaultValue={v.inventoryQty}
                      className={`w-24 rounded-lg border px-3 py-1.5 text-right text-sm outline-none focus:ring-2 focus:ring-purple-100 ${
                        v.inventoryQty === 0
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : v.inventoryQty <= 10
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-purple-100 text-purple-900"
                      }`}
                    />
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream">
          Save changes
        </button>
      </div>
    </form>
  );
}
