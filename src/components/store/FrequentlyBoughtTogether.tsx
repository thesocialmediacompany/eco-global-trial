"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/utils";

export interface FbtItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  emoji: string;
  gradient: string;
  imageUrl?: string;
  variantTitle?: string;
  weightGrams?: number;
}

/** "Frequently bought together" with per-item toggle + add-all. */
export function FrequentlyBoughtTogether({ items }: { items: FbtItem[] }) {
  const { addItem } = useCart();
  const [picked, setPicked] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i.productId, true])),
  );
  const [done, setDone] = useState(false);

  const chosen = items.filter((i) => picked[i.productId]);
  const total = chosen.reduce((s, i) => s + i.price, 0);

  function addAll() {
    chosen.forEach((i) =>
      addItem({
        productId: i.productId,
        slug: i.slug,
        title: i.title,
        variantTitle: i.variantTitle ?? "",
        price: i.price,
        emoji: i.emoji,
        gradient: i.gradient,
        imageUrl: i.imageUrl,
        weightGrams: i.weightGrams,
      }),
    );
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  return (
    <div className="rounded-[1.4rem] bg-white p-6 shadow-soft">
      {/* item thumbnails — all on a single line, + between */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it, i) => (
          <div key={it.productId} className="flex shrink-0 items-center gap-2.5">
            <label className="group relative cursor-pointer">
              <input
                type="checkbox"
                checked={!!picked[it.productId]}
                onChange={(e) =>
                  setPicked((p) => ({ ...p, [it.productId]: e.target.checked }))
                }
                className="peer sr-only"
              />
              <span
                className={`relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[1.1rem] border-2 text-2xl transition ${
                  picked[it.productId]
                    ? "border-purple-500"
                    : "border-purple-100 opacity-50"
                } ${it.imageUrl ? "bg-white" : it.gradient}`}
              >
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={it.title} fill sizes="80px" className="object-cover" />
                ) : (
                  it.emoji
                )}
                <span
                  className={`absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full text-cream ${
                    picked[it.productId] ? "bg-purple-600" : "bg-purple-300"
                  }`}
                >
                  {picked[it.productId] && <Check className="h-3 w-3" />}
                </span>
              </span>
            </label>
            {i < items.length - 1 && <Plus className="h-4 w-4 shrink-0 text-purple-900/40" />}
          </div>
        ))}
      </div>

      {/* total + add (below, full width) */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-purple-900/5 pt-4">
        <div>
          <p className="text-sm text-purple-900/60">
            Total for {chosen.length} item{chosen.length === 1 ? "" : "s"}
          </p>
          <p className="font-display text-2xl font-bold text-purple-900">
            {formatPKR(total)}
          </p>
        </div>
        <button
          onClick={addAll}
          disabled={chosen.length === 0}
          className="flex items-center justify-center gap-2 rounded-full gradient-purple-green px-7 py-3 text-sm font-bold uppercase tracking-wide text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:opacity-50"
        >
          {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {done ? "Added" : "Add selected"}
        </button>
      </div>

      {/* item list */}
      <ul className="mt-4 space-y-1.5 text-sm">
        {items.map((it) => (
          <li key={it.productId} className="flex items-center justify-between gap-3">
            <Link href={`/product/${it.slug}`} className="text-purple-900/80 hover:text-purple-700">
              {it.title}
            </Link>
            <span className="text-purple-900/60">{formatPKR(it.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
