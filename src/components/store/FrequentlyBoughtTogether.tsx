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
    <div className="rounded-2xl border border-purple-100 bg-white p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* item chips with + between */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {items.map((it, i) => (
            <div key={it.productId} className="flex items-center gap-2">
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
                  className={`relative grid h-20 w-20 place-items-center overflow-hidden rounded-xl border-2 text-2xl transition ${
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
              {i < items.length - 1 && <Plus className="h-4 w-4 text-purple-900/40" />}
            </div>
          ))}
        </div>

        {/* total + add */}
        <div className="lg:w-56">
          <p className="text-sm text-purple-900/60">
            Total for {chosen.length} item{chosen.length === 1 ? "" : "s"}
          </p>
          <p className="font-display text-2xl font-semibold text-purple-900">
            {formatPKR(total)}
          </p>
          <button
            onClick={addAll}
            disabled={chosen.length === 0}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full gradient-purple-green py-2.5 text-sm font-semibold text-cream transition hover:opacity-95 disabled:opacity-50"
          >
            {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {done ? "Added" : "Add selected"}
          </button>
        </div>
      </div>

      {/* item list */}
      <ul className="mt-5 space-y-1.5 border-t border-purple-50 pt-4 text-sm">
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
