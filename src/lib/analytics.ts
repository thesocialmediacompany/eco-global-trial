"use client";

/**
 * Thin client-side event helpers that forward to GA4 (gtag) and the Meta Pixel
 * (fbq) when present. All calls are no-ops when the pixels aren't configured,
 * so callers never need to guard.
 */

type GtagFn = (...args: unknown[]) => void;
type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: FbqFn;
    dataLayer?: unknown[];
  }
}

export interface TrackItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

/** Fire when a product is added to the cart. */
export function trackAddToCart(item: TrackItem) {
  if (typeof window === "undefined") return;
  const value = item.price * item.quantity;
  window.gtag?.("event", "add_to_cart", {
    currency: "PKR",
    value,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_variant: item.variant,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
  window.fbq?.("track", "AddToCart", {
    currency: "PKR",
    value,
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
  });
}

/** Fire once on the order-confirmation page for a completed purchase. */
export function trackPurchase(opts: {
  orderNumber: number;
  total: number;
  items: TrackItem[];
}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "purchase", {
    transaction_id: String(opts.orderNumber),
    currency: "PKR",
    value: opts.total,
    items: opts.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      item_variant: i.variant,
      price: i.price,
      quantity: i.quantity,
    })),
  });
  window.fbq?.("track", "Purchase", {
    currency: "PKR",
    value: opts.total,
    content_ids: opts.items.map((i) => i.id),
    content_type: "product",
    num_items: opts.items.reduce((s, i) => s + i.quantity, 0),
  });
}
