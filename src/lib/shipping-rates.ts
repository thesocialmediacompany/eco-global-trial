/**
 * Weight-based shipping rate logic. Pure + framework-agnostic so it can run on
 * both the client (cart estimate) and the server (authoritative checkout total).
 * The actual rate bands live in the ShippingRate table and are edited in the
 * admin Shipping page; this module just resolves a weight to a price.
 */

export interface ShippingBand {
  id?: string;
  label: string;
  /** inclusive lower bound in grams */
  minGrams: number;
  /** exclusive upper bound in grams, or null for "and above" */
  maxGrams: number | null;
  /** delivery charge for this band, in PKR */
  rate: number;
  sortOrder: number;
  active: boolean;
}

/** Config the cart/checkout needs to turn weight + subtotal into a shipping fee. */
export interface ShippingConfig {
  bands: ShippingBand[];
  /** order subtotal (after discount) at/above which delivery is free */
  freeShippingThreshold: number;
  /** charge used when no band matches the weight (safety net) */
  flatFallback: number;
}

/** Pick the band whose [minGrams, maxGrams) range contains the total weight. */
export function bandForWeight(grams: number, bands: ShippingBand[]): ShippingBand | null {
  const active = bands
    .filter((b) => b.active)
    .sort((a, b) => a.minGrams - b.minGrams);
  for (const b of active) {
    const underMax = b.maxGrams == null || grams < b.maxGrams;
    if (grams >= b.minGrams && underMax) return b;
  }
  // weight above every band's range → use the open-ended / heaviest band
  const openEnded = active.find((b) => b.maxGrams == null);
  if (openEnded) return openEnded;
  return active.length ? active[active.length - 1] : null;
}

/**
 * Resolve the delivery fee for an order.
 * Free when {@link ShippingConfig.freeShippingThreshold} is met or `freeShipping`
 * is forced (e.g. a free-shipping discount code). Otherwise the matching weight
 * band's rate, falling back to `flatFallback` when no band is configured.
 */
export function computeShipping(
  totalGrams: number,
  subtotalAfterDiscount: number,
  config: ShippingConfig,
  freeShipping = false,
): number {
  if (freeShipping) return 0;
  if (config.freeShippingThreshold > 0 && subtotalAfterDiscount >= config.freeShippingThreshold) {
    return 0;
  }
  const band = bandForWeight(totalGrams, config.bands);
  return band ? band.rate : config.flatFallback;
}
