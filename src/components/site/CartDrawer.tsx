"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    subtotal,
    shipping,
    freeShippingRemaining,
    isOpen,
    closeCart,
    updateQty,
    removeItem,
  } = useCart();

  const remaining = freeShippingRemaining;
  const threshold = subtotal + remaining;
  const progress = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-purple-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
                <ShoppingBag className="h-5 w-5" /> Your Cart
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full text-purple-900/70 hover:bg-purple-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="text-5xl">🛒</span>
                <p className="text-purple-900/60">Your cart is empty.</p>
                <button
                  onClick={closeCart}
                  className="rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                {/* free shipping bar */}
                <div className="border-b border-purple-100 px-5 py-3">
                  {remaining > 0 ? (
                    <p className="text-xs text-purple-900/70">
                      Add <strong>{formatPKR(remaining)}</strong> more for free shipping
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-green-700">
                      🎉 You&apos;ve unlocked free shipping!
                    </p>
                  )}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-purple-100">
                    <div
                      className="h-full rounded-full gradient-green transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* items */}
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {items.map((it) => (
                    <div
                      key={`${it.productId}-${it.variantTitle}`}
                      className="flex gap-3 rounded-2xl border border-purple-100 bg-white p-3"
                    >
                      <span
                        className={`relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl text-3xl ${
                          it.imageUrl ? "bg-white" : it.gradient
                        }`}
                      >
                        {it.imageUrl ? (
                          <Image src={it.imageUrl} alt={it.title} fill sizes="64px" className="object-cover" />
                        ) : (
                          it.emoji
                        )}
                      </span>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold leading-tight text-purple-900">
                              {it.title}
                            </p>
                            {it.variantTitle && (
                              <p className="text-xs text-purple-900/50">
                                {it.variantTitle}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(it.productId, it.variantTitle)}
                            aria-label={`Remove ${it.title}`}
                            className="-mr-1.5 -mt-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full text-purple-900/45 transition-colors hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100"
                          >
                            <Trash2 className="h-[1.15rem] w-[1.15rem]" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-purple-100">
                            <button
                              onClick={() =>
                                updateQty(it.productId, it.variantTitle, it.quantity - 1)
                              }
                              aria-label="Decrease"
                              className="grid h-7 w-7 place-items-center rounded-full text-purple-900/70 hover:bg-purple-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-medium text-purple-900">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQty(it.productId, it.variantTitle, it.quantity + 1)
                              }
                              aria-label="Increase"
                              className="grid h-7 w-7 place-items-center rounded-full text-purple-900/70 hover:bg-purple-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-purple-900">
                            {formatPKR(it.price * it.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* footer */}
                <div className="border-t border-purple-100 bg-white p-5">
                  <div className="mb-1 flex items-center justify-between text-sm text-purple-900/70">
                    <span>Subtotal</span>
                    <span className="text-purple-900">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="mb-3 flex items-center justify-between text-sm text-purple-900/70">
                    <span>Shipping</span>
                    <span className="text-purple-900">
                      {shipping === 0 ? "Free" : formatPKR(shipping)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block rounded-full gradient-purple-green py-3.5 text-center text-sm font-semibold text-cream transition hover:opacity-95"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="mt-2 block rounded-full border border-purple-200 py-3 text-center text-sm font-semibold text-purple-900 transition hover:bg-purple-50"
                  >
                    View cart
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
