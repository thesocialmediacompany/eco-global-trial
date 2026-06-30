import { Tag, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { createDiscount, updateDiscount, deleteDiscount } from "./actions";

export default async function DiscountsPage() {
  await requireOwner();
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
  const activeCount = discounts.filter((d) => d.active).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Discounts</h1>
        <p className="mt-1 text-sm text-purple-900/60">
          {discounts.length} code{discounts.length === 1 ? "" : "s"} ·{" "}
          {activeCount === 0 ? "none active right now" : `${activeCount} active`}. Set conditions
          (minimum spend, usage limit, expiry) and turn codes on/off without deleting them.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* list of editable discounts */}
        <div className="space-y-3">
          {discounts.length === 0 && (
            <p className="rounded-xl border border-purple-100 bg-white px-5 py-10 text-center text-sm text-purple-900/50 shadow-sm">
              No discount codes yet. Create one on the right.
            </p>
          )}
          {discounts.map((d) => (
            <div key={d.id} className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 font-display text-base font-semibold text-purple-900">
                  <Tag className="h-4 w-4 text-green-600" /> {d.code}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-purple-900/50">
                    Used {d.usedCount}
                    {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      d.active ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {d.active ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>

              <form action={updateDiscount.bind(null, d.id)} className="grid gap-3 sm:grid-cols-3">
                <Field label="Type">
                  <select name="type" defaultValue={d.type} className={input}>
                    <option value="percentage">Percentage off</option>
                    <option value="fixed">Fixed amount off (PKR)</option>
                    <option value="free_shipping">Free shipping</option>
                  </select>
                </Field>
                <Field label="Value (% or PKR)">
                  <input name="value" type="number" min={0} defaultValue={d.value} className={input} />
                </Field>
                <Field label="Min subtotal (PKR)">
                  <input name="minSubtotal" type="number" min={0} defaultValue={d.minSubtotal} className={input} />
                </Field>
                <Field label="Usage limit (blank = ∞)">
                  <input name="usageLimit" type="number" min={1} defaultValue={d.usageLimit ?? ""} placeholder="∞" className={input} />
                </Field>
                <Field label="Expires on">
                  <input
                    name="endsAt"
                    type="date"
                    defaultValue={d.endsAt ? d.endsAt.toISOString().slice(0, 10) : ""}
                    className={input}
                  />
                </Field>
                <label className="flex items-end gap-2 pb-2 text-sm text-purple-900">
                  <input type="checkbox" name="active" defaultChecked={d.active} className="h-4 w-4 accent-green-600" />
                  Active (running now)
                </label>
                <div className="flex items-center gap-2 sm:col-span-3">
                  <button className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
                    Save changes
                  </button>
                  <button
                    formAction={deleteDiscount.bind(null, d.id)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
                    aria-label="Delete discount"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          ))}
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
            <Field label="Usage limit (blank = unlimited)">
              <input name="usageLimit" type="number" min={1} placeholder="∞" className={input} />
            </Field>
            <Field label="Expires on (optional)">
              <input name="endsAt" type="date" className={input} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-purple-900">
              <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-green-600" />
              Active immediately
            </label>
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
