"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, X, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5 pt-32 text-center">
        <div>
          <span className="grid mx-auto h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-400">
            <Heart className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-purple-900">
            Your wishlist is empty
          </h1>
          <p className="mt-2 text-purple-900/60">Save your favourites for later.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full gradient-purple-green px-7 py-3.5 text-sm font-semibold text-cream"
          >
            <ShoppingBag className="h-4 w-4" /> Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-28 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-semibold text-purple-900">
        Your Wishlist <span className="text-purple-900/40">({items.length})</span>
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <motion.div
            key={it.productId}
            layout
            className="group relative overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm"
          >
            <button
              onClick={() => remove(it.productId)}
              aria-label="Remove"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-cream/90 text-purple-900/60 shadow transition hover:bg-white hover:text-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
            <Link
              href={`/product/${it.slug}`}
              className={`relative grid aspect-square place-items-center overflow-hidden text-6xl ${
                it.imageUrl ? "bg-white" : it.gradient
              }`}
            >
              {it.imageUrl ? (
                <Image src={it.imageUrl} alt={it.title} fill sizes="33vw" className="object-cover" />
              ) : (
                it.emoji
              )}
            </Link>
            <div className="p-5">
              <Link
                href={`/product/${it.slug}`}
                className="font-display text-lg font-semibold text-purple-900 hover:text-purple-700"
              >
                {it.title}
              </Link>
              <p className="mt-1 font-display text-lg font-semibold text-purple-900">
                {formatPKR(it.price)}
              </p>
              <button
                onClick={() => {
                  addItem({
                    productId: it.productId,
                    slug: it.slug,
                    title: it.title,
                    variantTitle: "",
                    price: it.price,
                    emoji: it.emoji,
                    gradient: it.gradient,
                    imageUrl: it.imageUrl,
                  });
                  remove(it.productId);
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full gradient-purple-green py-2.5 text-sm font-semibold text-cream transition hover:opacity-95"
              >
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
