"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPKR } from "@/lib/utils";

export interface ViewedItem {
  slug: string;
  title: string;
  price: number;
  emoji: string;
  gradient: string;
  imageUrl?: string;
}

const KEY = "egf-recently-viewed";
const MAX = 8;

/** Records the current product, then shows previously viewed ones. */
export function RecentlyViewed({ current }: { current: ViewedItem }) {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    let prev: ViewedItem[] = [];
    try {
      prev = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      prev = [];
    }
    // show others viewed before this visit
    setItems(prev.filter((p) => p.slug !== current.slug).slice(0, 6));
    // record current at the front
    const next = [current, ...prev.filter((p) => p.slug !== current.slug)].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.slug]);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
      <h2 className="mb-6 font-display text-2xl font-semibold text-purple-900">
        Recently viewed
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/product/${it.slug}`}
            className="group rounded-2xl border border-purple-100 bg-white p-3 transition hover:shadow-sm"
          >
            <span
              className={`relative grid aspect-square place-items-center overflow-hidden rounded-xl text-4xl ${
                it.imageUrl ? "bg-white" : it.gradient
              }`}
            >
              {it.imageUrl ? (
                <Image src={it.imageUrl} alt={it.title} fill sizes="160px" className="object-cover" />
              ) : (
                it.emoji
              )}
            </span>
            <p className="mt-2 line-clamp-2 text-xs font-medium text-purple-900 group-hover:text-purple-700">
              {it.title}
            </p>
            <p className="text-xs text-purple-900/60">{formatPKR(it.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
