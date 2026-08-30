/**
 * Automatic multi-buy discount: buy more of the SAME variant, save more.
 * Applies to every product. Stacks with coupon codes — at checkout the coupon
 * is applied to the already-discounted subtotal, so the two never double-count
 * the same rupees. No "use server"/"server-only" here so both the client cart
 * and the server checkout can share one source of truth.
 */
export const QTY_DISCOUNT_TIERS = [
  { minQty: 4, rate: 0.1, label: "10%" },
  { minQty: 3, rate: 0.075, label: "7.5%" },
  { minQty: 2, rate: 0.05, label: "5%" },
] as const;

/** Discount rate (0–1) for buying `qty` units of a single variant. */
export function qtyDiscountRate(qty: number): number {
  for (const t of QTY_DISCOUNT_TIERS) if (qty >= t.minQty) return t.rate;
  return 0;
}

/** Whole-rupees saved on a line of `qty` units priced at `unitPrice` each. */
export function qtyDiscountAmount(unitPrice: number, qty: number): number {
  return Math.round(unitPrice * qty * qtyDiscountRate(qty));
}

/** Tier rows for the "buy more, save more" widget, ordered low → high. */
export const QTY_DISCOUNT_ROWS = [...QTY_DISCOUNT_TIERS]
  .sort((a, b) => a.minQty - b.minQty)
  .map((t) => ({ qty: t.minQty, label: t.label, pct: t.rate * 100 }));
