"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Plus, Minus, Search, Gift } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { BundleInput, BundleResult } from "@/app/admin/(panel)/bundles/actions";

export interface PickerProduct {
  id: string;
  title: string;
  price: number;
  emoji: string;
  gradient: string;
  imageUrl: string;
}

export interface BundleFormData {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  status: string;
  imageUrl: string;
  emoji: string;
  items: { productId: string; quantity: number }[];
}

export function BundleForm({
  action,
  products,
  bundle,
}: {
  action: (input: BundleInput) => Promise<BundleResult>;
  products: PickerProduct[];
  bundle?: BundleFormData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: bundle?.title ?? "",
    tagline: bundle?.tagline ?? "",
    description: bundle?.description ?? "",
    price: bundle?.price ?? 0,
    status: bundle?.status ?? "active",
    emoji: bundle?.emoji ?? "🎁",
  });
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries((bundle?.items ?? []).map((i) => [i.productId, i.quantity])),
  );

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const selected = Object.entries(qty).filter(([, q]) => q > 0);
  const contentsValue = selected.reduce(
    (s, [id, q]) => s + (byId.get(id)?.price ?? 0) * q,
    0,
  );
  const savings = Math.max(0, contentsValue - (form.price || 0));

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  function setQ(id: string, n: number) {
    setQty((q) => ({ ...q, [id]: Math.max(0, n) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const imageUrl =
      (document.querySelector('input[name="imageUrl"]') as HTMLInputElement | null)?.value ?? "";
    startTransition(async () => {
      const res = await action({
        title: form.title,
        tagline: form.tagline,
        description: form.description,
        price: Number(form.price) || 0,
        status: form.status,
        emoji: form.emoji,
        imageUrl,
        items: selected.map(([productId, quantity]) => ({ productId, quantity })),
      });
      if (!res.ok) setError(res.error);
      else setSaved(true); // create redirects server-side; update stays here
    });
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/bundles")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
            aria-label="Back"
          >
            <X className="h-4 w-4" />
          </button>
          <h1 className="flex items-center gap-2 font-display text-xl font-semibold text-purple-900">
            <Gift className="h-5 w-5 text-green-600" />
            {bundle ? bundle.title : "New bundle"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save bundle"}
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {saved && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Bundle saved.</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <Field label="Bundle title *">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Breakfast Goodness Bundle"
                className={input}
              />
            </Field>
            <Field label="Tagline">
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className={input}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className={input}
              />
            </Field>
          </Card>

          {/* contents picker */}
          <Card title={`Bundle contents (${selected.length} products)`}>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-900/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the catalogue…"
                className={`${input} pl-9`}
              />
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {filtered.map((p) => {
                const q = qty[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                      q > 0 ? "border-green-300 bg-green-50/40" : "border-purple-100"
                    }`}
                  >
                    <span className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg text-lg ${p.imageUrl ? "bg-white" : p.gradient}`}>
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.title} fill sizes="40px" className="object-cover" />
                      ) : (
                        p.emoji
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-purple-900">{p.title}</p>
                      <p className="text-xs text-purple-900/50">{formatPKR(p.price)}</p>
                    </div>
                    <div className="flex items-center rounded-full border border-purple-200 bg-white">
                      <button type="button" onClick={() => setQ(p.id, q - 1)} aria-label="Decrease" className="grid h-7 w-7 place-items-center text-purple-900/60">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm">{q}</span>
                      <button type="button" onClick={() => setQ(p.id, q + 1)} aria-label="Increase" className="grid h-7 w-7 place-items-center text-purple-900/60">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Image">
            <ImageUploader defaultImageUrl={bundle?.imageUrl} defaultImages="" />
          </Card>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Card title="Pricing">
            <Field label="Bundle price (PKR) *">
              <input
                type="number"
                min={1}
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                required
                className={input}
              />
            </Field>
            <div className="space-y-1.5 rounded-lg bg-cream/70 p-3 text-sm">
              <div className="flex justify-between text-purple-900/70">
                <span>Contents value</span>
                <span className="font-medium text-purple-900">{formatPKR(contentsValue)}</span>
              </div>
              <div className="flex justify-between text-purple-900/70">
                <span>Customer saves</span>
                <span className={`font-semibold ${savings > 0 ? "text-green-700" : "text-purple-900/50"}`}>
                  {savings > 0 ? formatPKR(savings) : " - "}
                </span>
              </div>
              <p className="pt-1 text-[0.7rem] text-purple-900/45">
                Contents value becomes the strike-through compare-at price.
              </p>
            </div>
          </Card>

          <Card title="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={input}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Card>

          <Card title="Emoji (image fallback)">
            <input
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              maxLength={4}
              className={`${input} text-center text-2xl`}
            />
          </Card>
        </div>
      </div>
    </form>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 font-display text-base font-semibold text-purple-900">{title}</h2>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      {children}
    </label>
  );
}
