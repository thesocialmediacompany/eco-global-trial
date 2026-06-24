import { Tag, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { formatPKR } from "@/lib/utils";
import { createDiscount, toggleDiscount, deleteDiscount } from "./actions";

function describe(d: { type: string; value: number; minSubtotal: number }) {
  const base =
    d.type === "percentage"
      ? `${d.value}% off`
      : d.type === "fixed"
        ? `${formatPKR(d.value)} off`
        : "Free shipping";
  return d.minSubtotal > 0 ? `${base} · min ${formatPKR(d.minSubtotal)}` : base;
}

export default async function DiscountsPage() {
  await requireOwner();
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 font-display text-2xl font-semibold text-purple-900">Discounts</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* list */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Used</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-purple-900/50">
                    No discount codes yet.
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="border-b border-purple-50 last:border-0">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-purple-900">
                        <Tag className="h-3.5 w-3.5 text-green-600" /> {d.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-purple-900/70">{describe(d)}</td>
                    <td className="px-5 py-3 text-purple-900/70">
                      {d.usedCount}
                      {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                    </td>
                    <td className="px-5 py-3">
                      <form action={toggleDiscount.bind(null, d.id, !d.active)}>
                        <button
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            d.active
                              ? "bg-green-100 text-green-800"
                              : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {d.active ? "Active" : "Inactive"}
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteDiscount.bind(null, d.id)}>
                        <button
                          className="text-purple-900/30 hover:text-rose-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* create */}
        <div className="h-fit rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-base font-semibold text-purple-900">
            Create discount
          </h2>
          <form action={createDiscount} className="space-y-3">
            <Field label="Code">
              <input name="code" required placeholder="e.g. SUMMER15" className={input} />
            </Field>
            <Field label="Type">
              <select name="type" className={input}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off (PKR)</option>
                <option value="free_shipping">Free shipping</option>
              </select>
            </Field>
            <Field label="Value (% or PKR)">
              <input name="value" type="number" min={0} defaultValue={10} className={input} />
            </Field>
            <Field label="Minimum subtotal (PKR)">
              <input name="minSubtotal" type="number" min={0} defaultValue={0} className={input} />
            </Field>
            <button className="w-full rounded-lg gradient-purple-green py-2.5 text-sm font-semibold text-cream">
              Create discount
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      {children}
    </label>
  );
}
