import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Sales reporting for the admin "Sales Record" page and its CSV export.
 * Counts order lines in placed (non-draft) orders, excluding cancelled by
 * default. Revenue is the sum of line totals (PKR). Broken down per product +
 * variant, with a per-category rollup.
 */

export interface SalesRow {
  product: string;
  variant: string; // "" when the product has no meaningful variant
  category: string;
  units: number;
  revenue: number;
}

export interface SalesReport {
  from: Date;
  to: Date;
  totals: { lines: number; units: number; revenue: number };
  byCategory: { category: string; units: number; revenue: number }[];
  byItem: SalesRow[];
}

const PKT = "+05:00"; // Asia/Karachi, no DST

/** Parse the range query into a concrete [from, to] window (Asia/Karachi). */
export function resolveSalesRange(params: { range?: string; from?: string; to?: string }): {
  from: Date;
  to: Date;
  key: string;
  label: string;
} {
  const now = new Date();
  const to = params.to ? new Date(`${params.to}T23:59:59.999${PKT}`) : now;

  // Custom explicit from/to.
  if (params.from) {
    return { from: new Date(`${params.from}T00:00:00${PKT}`), to, key: "custom", label: "Custom" };
  }

  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
  switch (params.range) {
    case "30d": return { from: daysAgo(30), to, key: "30d", label: "Last 30 days" };
    case "90d": return { from: daysAgo(90), to, key: "90d", label: "Last 90 days" };
    case "1y": return { from: daysAgo(365), to, key: "1y", label: "Last 12 months" };
    case "all": return { from: new Date(0), to, key: "all", label: "All time" };
    default: {
      // Fiscal year to date — Pakistan's FY starts 1 July.
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Karachi", year: "numeric", month: "numeric",
      }).formatToParts(now);
      const y = Number(parts.find((p) => p.type === "year")!.value);
      const m = Number(parts.find((p) => p.type === "month")!.value);
      const fyYear = m >= 7 ? y : y - 1;
      return { from: new Date(`${fyYear}-07-01T00:00:00${PKT}`), to, key: "fytd", label: `FY ${fyYear}–${fyYear + 1} to date` };
    }
  }
}

export async function getSalesReport(opts: {
  from: Date;
  to: Date;
  includeCancelled?: boolean;
}): Promise<SalesReport> {
  const { from, to, includeCancelled } = opts;

  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        isDraft: false,
        createdAt: { gte: from, lte: to },
        ...(includeCancelled ? {} : { NOT: { fulfillmentStatus: "cancelled" } }),
      },
    },
    select: {
      title: true,
      variantTitle: true,
      quantity: true,
      total: true,
      product: { select: { collection: { select: { name: true } } } },
    },
  });

  const byKey = new Map<string, SalesRow>();
  const byCat = new Map<string, { units: number; revenue: number }>();
  let units = 0, revenue = 0;

  for (const it of items) {
    const category = it.product?.collection?.name ?? "Uncategorized";
    // Treat the placeholder variant names ("Default" / "Default Title") as no
    // variant, so single-variant products read as "—" and don't split into rows.
    const variant = it.variantTitle && !/^default(\s+title)?$/i.test(it.variantTitle.trim()) ? it.variantTitle : "";
    const key = `${it.title}\u0000${variant}`;

    const row = byKey.get(key) ?? { product: it.title, variant, category, units: 0, revenue: 0 };
    row.units += it.quantity;
    row.revenue += it.total;
    if (row.category === "Uncategorized" && category !== "Uncategorized") row.category = category;
    byKey.set(key, row);

    const c = byCat.get(category) ?? { units: 0, revenue: 0 };
    c.units += it.quantity;
    c.revenue += it.total;
    byCat.set(category, c);

    units += it.quantity;
    revenue += it.total;
  }

  return {
    from, to,
    totals: { lines: items.length, units, revenue },
    byCategory: [...byCat.entries()].map(([category, v]) => ({ category, ...v })).sort((a, b) => b.units - a.units),
    byItem: [...byKey.values()].sort((a, b) => b.units - a.units),
  };
}

/** Render a report as CSV (per product + variant), with a TOTAL row. */
export function salesReportCsv(r: SalesReport): string {
  const cell = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [
    ["Product", "Variant", "Category", "Units Sold", "Revenue (PKR)"].join(","),
    ...r.byItem.map((row) =>
      [cell(row.product), cell(row.variant), cell(row.category), row.units, row.revenue].join(","),
    ),
    ["TOTAL", "", "", r.totals.units, r.totals.revenue].join(","),
  ].join("\n");
}
