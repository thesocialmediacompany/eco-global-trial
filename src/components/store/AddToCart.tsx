"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Check, Truck, BadgeCheck, Clock, PackageX } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/utils";
import { paymentMethods } from "@/lib/payments";

interface Variant {
  title: string;
  price: number | null;
  inventoryQty: number;
  weightGrams?: number;
}

interface Props {
  productId: string;
  slug: string;
  title: string;
  basePrice: number;
  emoji: string;
  gradient: string;
  imageUrl?: string;
  variants: Variant[];
  freeShippingThreshold?: number;
}

function StockBadge({ qty }: { qty: number }) {
  if (qty <= 0)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Out of stock
      </span>
    );
  if (qty <= 10)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Only {qty} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> In stock
    </span>
  );
}

export function AddToCart({
  productId,
  slug,
  title,
  basePrice,
  emoji,
  gradient,
  imageUrl,
  variants,
  freeShippingThreshold = 7000,
}: Props) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  const variant = variants[selected];
  const price = variant?.price ?? basePrice;
  const outOfStock = variant ? variant.inventoryQty <= 0 : false;
  const weight = variant?.weightGrams ?? 0;
  const per100 = weight > 0 ? Math.round((price / weight) * 100) : null;

  // Show the sticky bar once the main buy box scrolls out of view.
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function handleAdd() {
    if (outOfStock) return;
    addItem(
      {
        productId,
        slug,
        title,
        variantTitle: variant?.title ?? "",
        price,
        emoji,
        gradient,
        imageUrl,
        weightGrams: weight,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const enabledPayments = paymentMethods.slice(0, 4);

  return (
    <div className="space-y-6" ref={buyRef}>
      {/* price + stock */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-display text-3xl font-semibold text-purple-900">
          {formatPKR(price)}
        </span>
        {per100 && (
          <span className="text-sm text-purple-900/50">{formatPKR(per100)} / 100g</span>
        )}
        {variant && <StockBadge qty={variant.inventoryQty} />}
      </div>

      {/* flavour / size selector */}
      {variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-purple-900/70">
            {/[0-9]+\s?(g|kg|ml)/i.test(variant?.title ?? "") ? "Size" : "Flavour"}:{" "}
            <span className="text-purple-900">{variant?.title}</span>
            {weight > 0 && (
              <span className="ml-1 text-purple-900/45">· {weight}g net</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.title}
                onClick={() => setSelected(i)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  i === selected
                    ? "border-purple-600 bg-purple-600 text-cream"
                    : v.inventoryQty <= 0
                      ? "border-purple-100 bg-purple-50/50 text-purple-900/40"
                      : "border-purple-200 bg-white text-purple-900 hover:border-purple-400"
                }`}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* qty + add */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-purple-200 bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="grid h-11 w-11 place-items-center rounded-full text-purple-900/70 hover:bg-purple-50"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium text-purple-900">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="grid h-11 w-11 place-items-center rounded-full text-purple-900/70 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-full gradient-purple-green px-8 py-3.5 text-sm font-semibold text-cream shadow-lg shadow-purple-900/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added to cart
            </>
          ) : outOfStock ? (
            "Out of stock"
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" /> Add to cart
            </>
          )}
        </motion.button>
      </div>

      {/* out-of-stock explainer so the disabled button has a clear reason */}
      {outOfStock && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-700">
          <PackageX className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            This item is <strong>currently out of stock</strong>. We restock regularly, so
            please check back in a few days. Need it urgently? Message us on WhatsApp and
            we&apos;ll let you know as soon as it&apos;s back.
          </span>
        </div>
      )}

      {/* delivery reassurance */}
      <div className="space-y-2.5 rounded-2xl border border-purple-100 bg-cream/40 p-4 text-sm text-purple-900/75">
        <p className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-green-600" />
          Free delivery on orders over {formatPKR(freeShippingThreshold)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-600" />
          Delivered across Pakistan in 2-5 working days
        </p>
        <p className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-green-600" />
          Cash on Delivery available
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-purple-900/45">We accept</span>
          {enabledPayments.map((m) => (
            <span
              key={m.id}
              title={m.label}
              className="grid h-7 min-w-9 place-items-center rounded-md border border-purple-100 bg-white px-1.5 text-base"
            >
              {m.icon}
            </span>
          ))}
        </div>
      </div>

      {/* sticky buy bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-100 bg-cream/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
              <span
                className={`relative hidden h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg text-xl sm:grid ${imageUrl ? "bg-white" : gradient}`}
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  emoji
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-purple-900">{title}</p>
                <p className="text-sm text-purple-900/60">
                  {formatPKR(price)}
                  {variants.length > 1 && variant ? ` · ${variant.title}` : ""}
                </p>
              </div>
              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex items-center gap-2 rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream disabled:opacity-50"
              >
                {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                {outOfStock ? "Out of stock" : added ? "Added" : "Add to cart"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
