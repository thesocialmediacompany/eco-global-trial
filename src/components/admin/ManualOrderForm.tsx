"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Minus } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { paymentMethods } from "@/lib/payments";
import { createManualOrder } from "@/app/admin/(panel)/orders/actions";

interface ProductOption {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  price: number;
  variants: { title: string; price: number | null }[];
}

export function ManualOrderForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [variant, setVariant] = useState<Record<string, string>>({});
  const [method, setMethod] = useState("cod");
  const [status, setStatus] = useState("pending");
  const [cust, setCust] = useState({ name: "", phone: "", email: "", address: "", city: "" });

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = products.filter((p) => (qty[p.id] ?? 0) > 0);
  const subtotal = selected.reduce((s, p) => {
    const v = p.variants.find((x) => x.title === (variant[p.id] ?? p.variants[0]?.title));
    return s + (v?.price ?? p.price) * (qty[p.id] ?? 0);
  }, 0);

  function setQ(id: string, n: number) {
    setQty((q) => ({ ...q, [id]: Math.max(0, n) }));
  }

  function submit(e: React.FormEvent, isDraft = false) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createManualOrder({
        customer: cust,
        items: selected.map((p) => ({
          productId: p.id,
          variantTitle: variant[p.id] ?? p.variants[0]?.title ?? "",
          quantity: qty[p.id],
        })),
        paymentMethod: method,
        paymentStatus: status,
        isDraft,
      });
      if (!res.ok) setError(res.error);
      // success redirects server-side
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
            aria-label="Back"
          >
            <X className="h-4 w-4" />
          </button>
          <h1 className="font-display text-xl font-semibold text-purple-900">Create order</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => submit(e, true)}
            disabled={pending}
            className="rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50 disabled:opacity-60"
          >
            Save as draft
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create order"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* products */}
          <Card title="Products">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className={`${input} mb-3`}
            />
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-purple-100 p-2.5"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-lg text-lg ${p.gradient}`}>
                    {p.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-purple-900">{p.title}</p>
                    <p className="text-xs text-purple-900/50">{formatPKR(p.price)}</p>
                  </div>
                  {p.variants.length > 1 && (qty[p.id] ?? 0) > 0 && (
                    <select
                      value={variant[p.id] ?? p.variants[0]?.title}
                      onChange={(e) => setVariant((v) => ({ ...v, [p.id]: e.target.value }))}
                      className="rounded-lg border border-purple-200 px-2 py-1 text-xs"
                    >
                      {p.variants.map((v) => (
                        <option key={v.title} value={v.title}>
                          {v.title}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="flex items-center rounded-full border border-purple-200">
                    <button
                      type="button"
                      onClick={() => setQ(p.id, (qty[p.id] ?? 0) - 1)}
                      className="grid h-7 w-7 place-items-center text-purple-900/60"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{qty[p.id] ?? 0}</span>
                    <button
                      type="button"
                      onClick={() => setQ(p.id, (qty[p.id] ?? 0) + 1)}
                      className="grid h-7 w-7 place-items-center text-purple-900/60"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* customer */}
          <Card title="Customer">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name *">
                <input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} required className={input} />
              </Field>
              <Field label="Phone *">
                <input value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} required className={input} />
              </Field>
              <Field label="Email">
                <input value={cust.email} onChange={(e) => setCust({ ...cust, email: e.target.value })} className={input} />
              </Field>
              <Field label="City">
                <input value={cust.city} onChange={(e) => setCust({ ...cust, city: e.target.value })} className={input} />
              </Field>
              <Field label="Address" className="sm:col-span-2">
                <input value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} className={input} />
              </Field>
            </div>
          </Card>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Card title="Payment">
            <Field label="Method">
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={input}>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={input}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </Field>
          </Card>

          <Card title="Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-purple-900/70">
                <span>Items</span>
                <span>{selected.reduce((s, p) => s + (qty[p.id] ?? 0), 0)}</span>
              </div>
              <div className="flex justify-between border-t border-purple-100 pt-2 font-semibold text-purple-900">
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-display text-base font-semibold text-purple-900">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      {children}
    </label>
  );
}
