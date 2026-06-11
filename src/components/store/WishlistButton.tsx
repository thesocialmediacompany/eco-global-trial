"use client";

import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  item,
  variant = "icon",
  className,
}: {
  item: WishlistItem;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const active = has(item.productId);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition",
          active
            ? "border-rose-200 bg-rose-50 text-rose-600"
            : "border-purple-200 text-purple-900 hover:bg-purple-50",
          className,
        )}
      >
        <Heart className={cn("h-4 w-4", active && "fill-rose-500 text-rose-500")} />
        {active ? "In wishlist" : "Add to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-purple-900 shadow transition hover:bg-white",
        className,
      )}
    >
      <Heart className={cn("h-[1.05rem] w-[1.05rem]", active && "fill-rose-500 text-rose-500")} />
    </button>
  );
}
