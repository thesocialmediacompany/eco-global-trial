import { Store, Trash2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { UploadField } from "@/components/admin/UploadField";
import { addStockist, updateStockist, deleteStockist } from "./actions";

export default async function StockistsPage() {
  await requireOwner();
  const stockists = await prisma.stockist.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-purple-900">
          <Store className="h-6 w-6 text-green-600" /> Stockists
        </h1>
        <p className="mt-1 text-sm text-purple-900/60">
          The retail partners shown in the homepage &ldquo;Also available at&rdquo; strip and the{" "}
          <strong>/stores</strong> page. Upload a logo, or leave it blank to show a coloured name
          badge. (Edit the heading text in Settings → Homepage text.)
        </p>
      </div>

      {/* existing */}
      <div className="space-y-3">
        {stockists.map((r) => (
          <div key={r.id} className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-4">
              {/* preview */}
              <div className="grid h-16 w-28 shrink-0 place-items-center rounded-lg border border-purple-100 bg-white">
                {r.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.logoUrl} alt={r.name} className="max-h-12 w-auto object-contain" />
                ) : (
                  <span className="text-center font-display text-sm font-bold leading-tight" style={{ color: r.color }}>
                    {r.name}
                  </span>
                )}
              </div>

              <form action={updateStockist.bind(null, r.id)} className="grid flex-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Name</span>
                  <input name="name" defaultValue={r.name} required className={input} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Badge colour</span>
                  <input name="color" type="text" defaultValue={r.color} placeholder="#3c6326" className={input} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Website link (optional)</span>
                  <input name="url" type="url" defaultValue={r.url} placeholder="https://…" className={input} />
                </label>
                <div className="sm:col-span-2">
                  <UploadField name="logoUrl" kind="image" label="Logo (optional — leave blank to keep / use name badge) · ~300×120px PNG" />
                </div>
                <label className="flex items-center gap-2 text-sm text-purple-900">
                  <input type="checkbox" name="active" defaultChecked={r.active} className="h-4 w-4 accent-green-600" />
                  Show on site
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Order</span>
                  <input name="sortOrder" type="number" defaultValue={r.sortOrder} className={`${input} w-24`} />
                </label>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <button className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">Save</button>
                  <button
                    formAction={deleteStockist.bind(null, r.id)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
                    aria-label="Delete stockist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* add */}
      <form action={addStockist} className="rounded-xl border border-dashed border-purple-200 bg-cream/30 p-4">
        <p className="mb-3 text-sm font-semibold text-purple-900">Add a stockist</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Name</span>
            <input name="name" required placeholder="e.g. Metro" className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Badge colour</span>
            <input name="color" type="text" defaultValue="#3c6326" className={input} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[0.7rem] font-medium text-purple-900/60">Website link (optional)</span>
            <input name="url" type="url" placeholder="https://…" className={input} />
          </label>
          <div className="sm:col-span-2">
            <UploadField name="logoUrl" kind="image" label="Logo (optional)" />
          </div>
          <label className="flex items-center gap-2 text-sm text-purple-900">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-green-600" />
            Show on site
          </label>
        </div>
        <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
          <Plus className="h-4 w-4" /> Add stockist
        </button>
      </form>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";
