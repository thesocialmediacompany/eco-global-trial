import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings, settingNumber } from "@/lib/settings";
import type { ShippingBand, ShippingConfig } from "@/lib/shipping-rates";

/**
 * Build the {@link ShippingConfig} the cart + checkout need: the weight bands
 * from the ShippingRate table plus the free-shipping threshold and flat
 * fallback from store Settings. Safe to call from server components / actions.
 */
export async function getShippingConfig(): Promise<ShippingConfig> {
  let rows: ShippingBand[] = [];
  try {
    const dbRows = await prisma.shippingRate.findMany({
      orderBy: { sortOrder: "asc" },
    });
    rows = dbRows.map((r) => ({
      id: r.id,
      label: r.label,
      minGrams: r.minGrams,
      maxGrams: r.maxGrams,
      rate: r.rate,
      sortOrder: r.sortOrder,
      active: r.active,
    }));
  } catch {
    rows = [];
  }

  const settings = await getSettings();
  return {
    bands: rows,
    freeShippingThreshold: settingNumber(settings, "freeShippingThreshold", 7000),
    flatFallback: settingNumber(settings, "flatShippingRate", 250),
  };
}
