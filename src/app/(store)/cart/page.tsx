"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR, formatWeight } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, totalWeight, shipping, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-5 pt-32 text-center">
        <div>
          <span className="text-6xl">🛒</span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-purple-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-purple-900/60">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full gradient-purple-green px-7 py-3.5 text-sm font-semibold text-cream"
          >
            <ShoppingBag className="h-4 w-4" /> Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 lg:px-8">
      <h1 className="mb-8 font-display text-4xl font-semibold text-purple-900">
        Your Cart
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* items */}
        <div className="space-y-4">
          {items.map((it) => (
            <motion.div
              key={`${it.productId}-${it.variantTitle}`}
              layout
              className="flex gap-4 rounded-2xl border border-purple-100 bg-white p-4"
            >
              <Link
                href={`/product/${it.slug}`}
                className={`relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl text-4xl ${
                  it.imageUrl ? "bg-white" : it.gradient
                }`}
              >
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={it.title} fill sizes="96px" className="object-cover" />
                ) : (
                  it.emoji
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/product/${it.slug}`}
                      className="font-display text-lg font-semibold text-purple-900 hover:text-purple-700"
                    >
                      {it.title}
                    </Link>
                    {it.variantTitle && (
                      <p className="text-sm text-purple-900/50">{it.variantTitle}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(it.productId, it.variantTitle)}
                    aria-label={`Remove ${it.title}`}
                    className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-purple-900/45 transition-colors hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-purple-200">
                    <button
                      onClick={() => updateQty(it.productId, it.variantTitle, it.quantity - 1)}
                      aria-label="Decrease"
                      className="grid h-9 w-9 place-items-center rounded-full text-purple-900/70 hover:bg-purple-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium text-purple-900">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(it.productId, it.variantTitle, it.quantity + 1)}
                      aria-label="Increase"
                      className="grid h-9 w-9 place-items-center rounded-full text-purple-900/70 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-display text-lg font-semibold text-purple-900">
                    {formatPKR(it.price * it.quantity)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* summary */}
        <div className="h-fit rounded-2xl border border-purple-100 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold text-purple-900">
            Order summary
          </h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-purple-900/70">
              <span>Subtotal</span>
              <span className="text-purple-900">{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-purple-900/70">
              <span>
                Shipping
                {totalWeight > 0 && (
                  <span className="ml-1 text-xs text-purple-900/40">
                    ({formatWeight(totalWeight)})
                  </span>
                )}
              </span>
              <span className="text-purple-900">
                {shipping === 0 ? "Free" : formatPKR(shipping)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-purple-100 pt-3 font-display text-lg font-semibold text-purple-900">
              <span>Total</span>
              <span>{formatPKR(subtotal + shipping)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex items-center justify-center gap-2 rounded-full gradient-purple-green py-3.5 text-sm font-semibold text-cream transition hover:opacity-95"
          >
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm font-medium text-purple-900/60 hover:text-purple-900"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
