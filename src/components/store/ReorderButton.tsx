"use client";

import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";

/**
 * "Buy again" — re-adds every line from a past order to the cart in one tap.
 * Items are pre-resolved on the server (slug/emoji/weight from the Product).
 */
export function ReorderButton({
  items,
}: {
  items: (Omit<CartItem, "quantity"> & { quantity: number })[];
}) {
  const { addItem, openCart } = useCart();
  const [done, setDone] = useState(false);

  function reorder() {
    if (items.length === 0) return;
    items.forEach(({ quantity, ...item }) => addItem(item, quantity));
    openCart();
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  return (
    <button
      onClick={reorder}
      className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-purple-900 transition hover:bg-purple-50"
    >
      {done ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-600" /> Added
        </>
      ) : (
        <>
          <RotateCcw className="h-3.5 w-3.5" /> Buy again
        </>
      )}
    </button>
  );
}
