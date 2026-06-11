"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Star, Plus, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { WishlistButton } from "@/components/store/WishlistButton";

/** Animated product card with hovering pack-art and quick-add. */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
        )
      : null;

  function quickAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.name,
      variantTitle: product.flavours?.[0] ?? "",
      price: product.price,
      emoji: product.emoji,
      gradient: product.gradient,
      imageUrl: product.imageUrl,
      weightGrams: product.weightGrams,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-purple-900/10"
    >
      {/* Pack art */}
      <div
        className={`relative aspect-square overflow-hidden ${product.imageUrl ? "bg-white" : product.gradient}`}
      >
        {/* badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-cream px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-purple-800">
              New
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-green-500 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* product image or emoji fallback */}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <motion.div
            className="absolute inset-0 grid place-items-center text-[5.5rem] drop-shadow-xl"
            initial={false}
            whileHover={{ scale: 1.12, rotate: -6 }}
            transition={{ type: "spring", stiffness: 250, damping: 14 }}
          >
            {product.emoji}
          </motion.div>
        )}

        {/* wishlist heart */}
        <div className="absolute right-3 top-3 z-20">
          <WishlistButton
            item={{
              productId: product.id,
              slug: product.slug,
              title: product.name,
              price: product.price,
              emoji: product.emoji,
              gradient: product.gradient,
              imageUrl: product.imageUrl,
            }}
          />
        </div>

        {/* shine sweep on hover */}
        <div className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />

        {/* quick add (above the stretched link) */}
        <motion.button
          type="button"
          onClick={quickAdd}
          whileTap={{ scale: 0.85 }}
          aria-label={`Add ${product.name} to cart`}
          className={`absolute bottom-3 right-3 z-20 grid h-11 w-11 translate-y-2 place-items-center rounded-full opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
            added ? "bg-green-500 text-white opacity-100" : "bg-cream text-purple-900 hover:bg-white"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Check className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Plus className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center gap-1 text-xs text-gold-500">
          {product.rating && (
            <>
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
              <span className="font-semibold text-purple-900">{product.rating}</span>
              <span className="text-purple-900/50">({product.reviewCount})</span>
            </>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold leading-snug text-purple-900">
          <Link
            href={`/product/${product.slug}`}
            className="before:absolute before:inset-0 before:z-10 before:content-[''] hover:text-purple-700"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-purple-900/60">{product.tagline}</p>

        {product.flavours && product.flavours.length > 1 && (
          <p className="mt-2 text-xs font-medium text-green-600">
            {product.flavours.length} flavours
          </p>
        )}

        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold text-purple-900">
              {formatPKR(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-purple-900/40 line-through">
                {formatPKR(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
