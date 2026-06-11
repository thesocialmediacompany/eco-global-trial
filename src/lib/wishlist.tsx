"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface WishlistItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  emoji: string;
  gradient: string;
  imageUrl?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "egf-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      has: (productId) => items.some((i) => i.productId === productId),
      toggle: (item) =>
        setItems((prev) =>
          prev.some((i) => i.productId === item.productId)
            ? prev.filter((i) => i.productId !== item.productId)
            : [...prev, item],
        ),
      remove: (productId) =>
        setItems((prev) => prev.filter((i) => i.productId !== productId)),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
