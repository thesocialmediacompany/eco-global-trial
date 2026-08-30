"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { WishlistButton } from "@/components/store/WishlistButton";

/**
 * Alpino-style "Customer's favourite" product cell: the pack floats on the
 * section gradient (no card), with a discount badge, wishlist heart, name,
 * rating, price and an ADD TO CART pill beneath.
 */
export function FloatingProductCard({
  product,
  cutout,
}: {
  product: Product;
  /** transparent background-removed pack image (preferred over the photo) */
  cutout?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const src = cutout ?? product.imageUrl;
  const outOfStock = product.inStock === false;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
        )
      : null;

  function add() {
    if (outOfStock) return;
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
    <div className="group relative flex flex-col items-center text-center">
      {/* discount badge */}
      {discount && !outOfStock && (
        <span className="absolute left-0 top-0 z-20 grid h-12 w-12 place-items-center rounded-full bg-rose-600 text-[0.6rem] font-bold uppercase leading-tight text-white shadow-soft-sm sm:h-14 sm:w-14 sm:text-xs">
          {discount}%<br />off
        </span>
      )}

      {/* wishlist heart */}
      <div className="absolute right-0 top-0 z-20">
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

      {/* floating pack */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square w-full"
        aria-label={product.name}
      >
        {src ? (
          <Image
            src={src}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 23vw"
            className={`object-contain p-2 drop-shadow-[0_16px_22px_rgba(34,51,26,.24)] transition-transform duration-300 group-hover:scale-105 ${
              outOfStock ? "opacity-70" : ""
            }`}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-7xl">
            {product.emoji}
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-1/2 top-1/2 z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-center text-[0.65rem] font-bold uppercase text-purple-900 shadow-soft-sm">
            Sold out
          </span>
        )}
      </Link>

      {/* name */}
      <h3 className="mt-3 line-clamp-2 min-h-[2.4rem] font-display text-sm font-bold uppercase leading-tight text-purple-800 sm:text-base">
        <Link href={`/product/${product.slug}`} className="hover:text-purple-600">
          {product.name}
        </Link>
      </h3>

      {/* rating */}
      <div className="mt-1.5 flex items-center justify-center gap-1 text-xs">
        {product.rating ? (
          <>
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating!)
                      ? "fill-gold-400 text-gold-400"
                      : "text-purple-900/20"
                  }`}
                />
              ))}
            </span>
            <span className="font-semibold text-purple-900/55">
              ({product.reviewCount ?? 0})
            </span>
          </>
        ) : (
          <span className="text-purple-900/40">No reviews</span>
        )}
      </div>

      {/* price */}
      <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2">
        <span className="font-display text-lg font-bold text-purple-900">
          {formatPKR(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="text-sm text-purple-900/40 line-through">
            {formatPKR(product.compareAtPrice)}
          </span>
        )}
      </div>

      {/* add to cart */}
      <button
        type="button"
        onClick={add}
        disabled={outOfStock}
        className={`mt-3 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide shadow-soft transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
          added
            ? "bg-green-600 text-white"
            : "bg-purple-700 text-cream hover:-translate-y-0.5 hover:bg-purple-800 hover:shadow-soft-lg"
        }`}
      >
        {added ? "Added ✓" : outOfStock ? "Sold out" : "Add to cart"}
      </button>
    </div>
  );
}
