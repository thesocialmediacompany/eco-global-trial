"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  computeShipping,
  type ShippingConfig,
} from "@/lib/shipping-rates";
import { trackAddToCart } from "@/lib/analytics";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  variantTitle: string;
  price: number;
  emoji: string;
  gradient: string;
  imageUrl?: string;
  quantity: number;
  /** net weight of one unit in grams, for the shipping estimate */
  weightGrams?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** total weight of the cart in grams */
  totalWeight: number;
  /** estimated delivery fee for the current cart (0 when free) */
  shipping: number;
  /** how much more subtotal is needed for free delivery (0 once reached) */
  freeShippingRemaining: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string, variantTitle: string) => void;
  updateQty: (productId: string, variantTitle: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "egf-cart";

function keyOf(productId: string, variantTitle: string) {
  return `${productId}::${variantTitle}`;
}

export function CartProvider({
  children,
  shippingConfig,
}: {
  children: ReactNode;
  shippingConfig: ShippingConfig;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, qty = 1) {
    setItems((prev) => {
      const k = keyOf(item.productId, item.variantTitle);
      const existing = prev.find((i) => keyOf(i.productId, i.variantTitle) === k);
      if (existing) {
        return prev.map((i) =>
          keyOf(i.productId, i.variantTitle) === k
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setIsOpen(true);
    trackAddToCart({
      id: item.productId,
      name: item.title,
      price: item.price,
      quantity: qty,
      variant: item.variantTitle || undefined,
    });
  }

  function removeItem(productId: string, variantTitle: string) {
    const k = keyOf(productId, variantTitle);
    setItems((prev) => prev.filter((i) => keyOf(i.productId, i.variantTitle) !== k));
  }

  function updateQty(productId: string, variantTitle: string, qty: number) {
    const k = keyOf(productId, variantTitle);
    setItems((prev) =>
      prev
        .map((i) =>
          keyOf(i.productId, i.variantTitle) === k
            ? { ...i, quantity: Math.max(0, qty) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function clear() {
    setItems([]);
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalWeight = items.reduce(
      (s, i) => s + (i.weightGrams ?? 0) * i.quantity,
      0,
    );
    const shipping =
      items.length === 0
        ? 0
        : computeShipping(totalWeight, subtotal, shippingConfig);
    const threshold = shippingConfig.freeShippingThreshold;
    const freeShippingRemaining =
      threshold > 0 && subtotal < threshold ? threshold - subtotal : 0;
    return {
      items,
      count,
      subtotal,
      totalWeight,
      shipping,
      freeShippingRemaining,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      updateQty,
      clear,
    };
  }, [items, isOpen, shippingConfig]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
