"use client";

import { useEffect } from "react";
import { trackPurchase, type TrackItem } from "@/lib/analytics";

/**
 * Fires the GA4 + Meta Pixel "purchase" conversion once when the order
 * confirmation page mounts. Deduped per order via sessionStorage so a refresh
 * doesn't double-count.
 */
export function PurchaseTracker({
  orderNumber,
  total,
  items,
}: {
  orderNumber: number;
  total: number;
  items: TrackItem[];
}) {
  useEffect(() => {
    const key = `egf-purchase-${orderNumber}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore storage errors, still track */
    }
    trackPurchase({ orderNumber, total, items });
  }, [orderNumber, total, items]);

  return null;
}
