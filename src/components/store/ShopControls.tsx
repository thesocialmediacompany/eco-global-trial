"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

const SORTS = [
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

export function ShopControls({
  collections,
  priceMax,
  total,
}: {
  collections: { slug: string; name: string }[];
  priceMax: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const current = {
    sort: params.get("sort") ?? "new",
    collection: params.get("collection") ?? "",
    min: params.get("min") ?? "",
    max: params.get("max") ?? "",
    instock: params.get("instock") === "1",
  };
  const hasFilters =
    current.collection || current.min || current.max || current.instock;

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    // keep the "new" tab filter sticky with sort
    router.push(`/shop?${next.toString()}`, { scroll: false });
  }

  const inputCls =
    "rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-400";

  return (
    <div className="mb-8 rounded-2xl border border-purple-100 bg-white/70 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-900">
          <SlidersHorizontal className="h-4 w-4" /> {total} product{total === 1 ? "" : "s"}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={current.collection}
            onChange={(e) => update({ collection: e.target.value || null })}
            className={inputCls}
            aria-label="Category"
          >
            <option value="">All categories</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={current.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className={inputCls}
            aria-label="Sort by"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-purple-100 pt-3">
        <div className="flex items-center gap-2 text-sm text-purple-900/70">
          <span>Price</span>
          <input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={current.min}
            onBlur={(e) => update({ min: e.target.value || null })}
            className={`w-24 ${inputCls}`}
          />
          <span>–</span>
          <input
            type="number"
            min={0}
            placeholder={priceMax ? `Max (${priceMax})` : "Max"}
            defaultValue={current.max}
            onBlur={(e) => update({ max: e.target.value || null })}
            className={`w-28 ${inputCls}`}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-purple-900/70">
          <input
            type="checkbox"
            checked={current.instock}
            onChange={(e) => update({ instock: e.target.checked ? "1" : null })}
            className="h-4 w-4 rounded accent-green-600"
          />
          In stock only
        </label>

        {hasFilters && (
          <button
            onClick={() =>
              update({ collection: null, min: null, max: null, instock: null })
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-900/50 hover:text-rose-600"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
