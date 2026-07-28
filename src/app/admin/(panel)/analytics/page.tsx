import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  Eye,
  Globe,
  Monitor,
  MapPin,
  Target,
  Truck,
  PackageCheck,
  XCircle,
  UserPlus,
  Repeat,
  RotateCcw,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { formatPKR } from "@/lib/utils";
import { getPaymentMethod } from "@/lib/payments";
import {
  getGA4Overview,
  getGA4TopPages,
  getGA4DeviceBreakdown,
  ga4Configured,
  ga4Diagnose,
} from "@/lib/ga4";

const DAY_MS = 24 * 60 * 60 * 1000;
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

// Eco Global Foods brand accents — the GA4 layout in our own palette.
const ACCENT = "#5e3052"; // purple-600 (primary)
const POSITIVE = "#3c6326"; // green-600 (up = good)

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

/** Compact money for chart axes: Rs 12.5k / Rs 1.2M. */
function fmtCompact(n: number) {
  if (n >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Rs ${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `Rs ${Math.round(n)}`;
}

/** The date a Date falls on in Pakistan, as YYYY-MM-DD (what GA4 wants). */
function pktDay(d: Date) {
  return new Date(d.getTime() + PKT_OFFSET_MS).toISOString().slice(0, 10);
}

function fmtShort(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
  }).format(d);
}

function fmtHour(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    hour12: true,
  }).format(d);
}

function presetDays(range: string) {
  const m = /^(\d+)daysAgo$/.exec(range);
  return m ? Number(m[1]) : 30;
}

// Pakistan midnight (UTC+5, no DST) for the "Today" range, so it means the
// local calendar day rather than a rolling 24 hours. (PKT_OFFSET_MS is defined
// above.)
function startOfPktToday(now: Date) {
  const shifted = new Date(now.getTime() + PKT_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - PKT_OFFSET_MS);
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** ▲/▼ % vs the previous equal period. Everything here is "up = good". */
function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev <= 0) {
    return cur > 0 ? <span className="text-xs font-semibold text-[#3c6326]">New</span> : null;
  }
  const pct = Math.round(((cur - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-[#3c6326]" : "text-[#d93025]"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

/**
 * GA4-style area + line chart. Full-bleed SVG (distorts horizontally via
 * preserveAspectRatio=none, but the stroke stays crisp with non-scaling-stroke),
 * with three horizontal gridlines + value labels drawn as an HTML overlay so the
 * text never distorts.
 */
function AreaChart({ values }: { values: number[] }) {
  const W = 720;
  const H = 240;
  const padY = 6;
  const max = Math.max(1, ...values);
  const n = values.length;
  const xAt = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const yAt = (v: number) => padY + (1 - v / max) * (H - 2 * padY);
  const line = values.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;

  return (
    <div className="relative h-56 w-full">
      {/* Gridlines + axis labels (HTML overlay, undistorted). */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        {[max, max / 2, 0].map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-right text-[0.65rem] tabular-nums text-slate-400">
              {fmtCompact(v)}
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
        ))}
      </div>
      {/* The chart itself, inset past the label gutter. */}
      <div className="absolute inset-y-0 left-16 right-0">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="ga4-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.18" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#ga4-area)" />
          <polyline
            points={line}
            fill="none"
            stroke={ACCENT}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  await requireOwner();
  const params = await searchParams;

  const range = params.range ?? "30daysAgo";
  const presets = [
    { label: "Today",    value: "today"      },
    { label: "7 days",   value: "7daysAgo"   },
    { label: "30 days",  value: "30daysAgo"  },
    { label: "90 days",  value: "90daysAgo"  },
    { label: "6 months", value: "180daysAgo" },
    { label: "1 year",   value: "365daysAgo" },
  ];

  // Resolve one concrete window that drives BOTH the store figures and GA4, so
  // the whole page describes the same period — the store cards used to ignore
  // the range entirely.
  const now = new Date();
  const custom = Boolean(params.from && params.to);
  const start = custom
    ? new Date(`${params.from}T00:00:00+05:00`)
    : range === "today"
      ? startOfPktToday(now)
      : new Date(now.getTime() - presetDays(range) * DAY_MS);
  const end = custom ? new Date(`${params.to}T23:59:59.999+05:00`) : now;
  const lenMs = Math.max(DAY_MS, end.getTime() - start.getTime());
  const prevStart = new Date(start.getTime() - lenMs);

  const rangeLabel = custom
    ? `${fmtShort(start)} – ${fmtShort(end)}`
    : presets.find((p) => p.value === range)?.label ?? "30 days";

  const inWindow = { isDraft: false, createdAt: { gte: start, lte: end } };
  const inPrev = { isDraft: false, createdAt: { gte: prevStart, lt: start } };

  const [
    rows,
    itemsAgg,
    prevGrossAgg,
    prevOrders,
    prevItemsAgg,
    topProducts,
    byMethod,
    fulfilledCount,
    deliveredCount,
    cancelledCount,
    ga4,
    topPages,
    devices,
    custActive,
    custFirst,
    abandonedByStatus,
  ] = await Promise.all([
    // One read powers the totals, the trend chart and the city breakdown.
    prisma.order.findMany({
      where: inWindow,
      select: { createdAt: true, total: true, city: true },
    }),
    prisma.orderItem.aggregate({ where: { order: inWindow }, _sum: { quantity: true } }),
    prisma.order.aggregate({ where: inPrev, _sum: { total: true } }),
    prisma.order.count({ where: inPrev }),
    prisma.orderItem.aggregate({ where: { order: inPrev }, _sum: { quantity: true } }),
    prisma.orderItem.groupBy({
      by: ["title"],
      where: { order: inWindow },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 6,
    }),
    prisma.order.groupBy({
      by: ["paymentMethod"],
      where: inWindow,
      _count: { _all: true },
      _sum: { total: true },
    }),
    // COD fulfilment funnel: of the orders PLACED in this window, how many
    // reached each stage.
    prisma.order.count({ where: { ...inWindow, fulfillmentStatus: "fulfilled" } }),
    prisma.order.count({ where: { ...inWindow, deliveredAt: { not: null } } }),
    prisma.order.count({ where: { ...inWindow, fulfillmentStatus: "cancelled" } }),
    getGA4Overview(pktDay(start), pktDay(end)),
    getGA4TopPages(pktDay(start), pktDay(end)),
    getGA4DeviceBreakdown(pktDay(start), pktDay(end)),
    // New vs returning: customers who ordered in this window, with the revenue
    // they brought. Paired with each customer's all-time first order (below) to
    // decide which side they fall on.
    prisma.order.groupBy({
      by: ["customerId"],
      where: { ...inWindow, customerId: { not: null } },
      _count: { _all: true },
      _sum: { total: true },
    }),
    // Every customer's first-ever (non-draft) order date, so a buyer counts as
    // "new" only if that first order lands inside the window.
    prisma.order.groupBy({
      by: ["customerId"],
      where: { isDraft: false, customerId: { not: null } },
      _min: { createdAt: true },
    }),
    // Abandoned-cart recovery: carts abandoned in this window, split by whether
    // they were later recovered, with the subtotal at stake on each side.
    prisma.abandonedCheckout.groupBy({
      by: ["recovered"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { _all: true },
      _sum: { subtotal: true },
    }),
  ]);

  const ga4Problem = !ga4 && ga4Configured() ? await ga4Diagnose() : null;

  // Current-window totals (from the single order read).
  const orders = rows.length;
  const grossSales = rows.reduce((s, r) => s + r.total, 0);
  const itemsSold = itemsAgg._sum.quantity ?? 0;
  const aov = orders ? Math.round(grossSales / orders) : 0;

  const prevGross = prevGrossAgg._sum.total ?? 0;
  const prevItems = prevItemsAgg._sum.quantity ?? 0;
  const prevAov = prevOrders ? Math.round(prevGross / prevOrders) : 0;

  const storeStats = [
    { label: "Sales", value: formatPKR(grossSales), icon: TrendingUp, cur: grossSales, prev: prevGross },
    { label: "Orders", value: orders.toString(), icon: ShoppingCart, cur: orders, prev: prevOrders },
    { label: "Avg order value", value: formatPKR(aov), icon: Receipt, cur: aov, prev: prevAov },
    { label: "Items sold", value: itemsSold.toString(), icon: Package, cur: itemsSold, prev: prevItems },
  ];

  // Traffic → sales conversion (needs GA4). "Of visitors, how many bought."
  const conversionRate =
    ga4 && ga4.sessions > 0 ? (orders / ga4.sessions) * 100 : null;
  // COD fulfilment funnel + delivery rate.
  const deliveryRate = orders > 0 ? Math.round((deliveredCount / orders) * 100) : 0;

  // New vs returning customers. A customer is "new" when their all-time first
  // order falls inside this window; anyone with an earlier order is "returning".
  const firstOrderById = new Map(custFirst.map((c) => [c.customerId, c._min.createdAt]));
  let newCust = 0, retCust = 0, newRev = 0, retRev = 0;
  for (const c of custActive) {
    const first = firstOrderById.get(c.customerId);
    const isReturning = first != null && first < start;
    if (isReturning) {
      retCust += 1;
      retRev += c._sum.total ?? 0;
    } else {
      newCust += 1;
      newRev += c._sum.total ?? 0;
    }
  }
  const activeCust = newCust + retCust;
  const repeatRate = activeCust > 0 ? Math.round((retCust / activeCust) * 100) : 0;

  // Abandoned-cart recovery snapshot.
  const abRecoveredRow = abandonedByStatus.find((r) => r.recovered);
  const abLostRow = abandonedByStatus.find((r) => !r.recovered);
  const abRecovered = abRecoveredRow?._count._all ?? 0;
  const abLost = abLostRow?._count._all ?? 0;
  const abTotal = abRecovered + abLost;
  const abRecoveredVal = abRecoveredRow?._sum.subtotal ?? 0;
  const abLostVal = abLostRow?._sum.subtotal ?? 0;
  const recoveryRate = abTotal > 0 ? Math.round((abRecovered / abTotal) * 100) : 0;

  // Revenue trend: hourly for Today, else daily / weekly / monthly.
  const isToday = range === "today" && !custom;
  const HOUR_MS = 60 * 60 * 1000;
  const days = Math.round(lenMs / DAY_MS);
  const binMs = isToday ? HOUR_MS : (days <= 31 ? 1 : days <= 180 ? 7 : 30) * DAY_MS;
  const nBins = Math.max(1, Math.ceil(lenMs / binMs));
  const bins = Array.from({ length: nBins }, (_, i) => ({
    start: new Date(start.getTime() + i * binMs),
    revenue: 0,
  }));
  for (const r of rows) {
    const idx = Math.min(nBins - 1, Math.max(0, Math.floor((r.createdAt.getTime() - start.getTime()) / binMs)));
    bins[idx].revenue += r.total;
  }
  const binLabel = isToday ? "hour" : binMs === DAY_MS ? "day" : binMs === 7 * DAY_MS ? "week" : "month";
  const fmtBin = isToday ? fmtHour : fmtShort;

  // Sales by city (normalised so "karachi"/"Karachi" merge).
  const cityMap = new Map<string, { orders: number; revenue: number }>();
  for (const r of rows) {
    const raw = (r.city ?? "").trim();
    const key = raw ? titleCase(raw.toLowerCase()) : "Unknown";
    const e = cityMap.get(key) ?? { orders: 0, revenue: 0 };
    e.orders += 1;
    e.revenue += r.total;
    cityMap.set(key, e);
  }
  const cities = [...cityMap.entries()]
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
  const maxCityRev = Math.max(1, ...cities.map((c) => c.revenue));

  const maxQty = Math.max(1, ...topProducts.map((p) => p._sum.quantity ?? 0));
  const methodTotal = Math.max(1, byMethod.reduce((s, m) => s + (m._count._all ?? 0), 0));
  const totalDeviceSessions = Math.max(1, devices.reduce((s, d) => s + d.sessions, 0));
  const maxPageViews = Math.max(1, ...topPages.map((p) => p.views));

  return (
    <div className="mx-auto max-w-6xl text-slate-700">
      {/* Header + range */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">{rangeLabel} · vs previous period</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => {
            const active = range === p.value && !custom;
            return (
              <Link
                key={p.value}
                href={`?range=${p.value}`}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-[#5e3052] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </Link>
            );
          })}
          <form method="GET" className="flex items-center gap-1">
            <input type="date" name="from" defaultValue={params.from ?? ""}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#5e3052]" />
            <span className="text-xs text-slate-400">to</span>
            <input type="date" name="to" defaultValue={params.to ?? ""}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#5e3052]" />
            <button type="submit"
              className="rounded-lg bg-[#5e3052] px-3 py-1 text-xs font-semibold text-white hover:bg-[#4a2341]">
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Store scorecards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {storeStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</span>
              <s.icon className="h-4 w-4 text-slate-300" />
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{s.value}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <Delta cur={s.cur} prev={s.prev} />
              <span className="text-xs text-slate-400">vs previous</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue over time — the hero graph */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-slate-500">Sales over time</h2>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{formatPKR(grossSales)}</div>
          </div>
          <span className="text-xs text-slate-400">by {binLabel}</span>
        </div>
        {orders === 0 ? (
          <p className="py-14 text-center text-sm text-slate-400">No orders in this period.</p>
        ) : (
          <>
            <AreaChart values={bins.map((b) => b.revenue)} />
            <div className="mt-2 flex justify-between pl-16 text-[0.65rem] text-slate-400">
              <span>{fmtBin(bins[0].start)}</span>
              {bins.length > 2 && <span>{fmtBin(bins[Math.floor((bins.length - 1) / 2)].start)}</span>}
              <span>{fmtBin(bins[bins.length - 1].start)}</span>
            </div>
          </>
        )}
      </div>

      {/* Acquisition — Google Analytics traffic */}
      <div className="mt-6 mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-[#5e3052]" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Acquisition · Google Analytics
        </span>
      </div>
      {ga4 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            { label: "Users",        value: ga4.users.toLocaleString(),          icon: Users },
            { label: "Sessions",     value: ga4.sessions.toLocaleString(),       icon: TrendingUp },
            { label: "Conversion",   value: conversionRate != null ? `${conversionRate.toFixed(1)}%` : "—", icon: Target },
            { label: "Page Views",   value: ga4.pageViews.toLocaleString(),      icon: Eye },
            { label: "Avg Duration", value: fmtDuration(ga4.avgSessionDuration), icon: Monitor },
            { label: "Bounce Rate",  value: `${ga4.bounceRate}%`,                icon: Globe },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</span>
                <s.icon className="h-4 w-4 text-slate-300" />
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{s.value}</div>
            </div>
          ))}
        </div>
      ) : !ga4Configured() ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Google Analytics isn&apos;t connected yet. Add <code>GA4_PROPERTY_ID</code>,{" "}
          <code>GA4_CLIENT_EMAIL</code> and <code>GA4_PRIVATE_KEY</code> in AWS Amplify
          (Hosting → Environment variables) and redeploy. Your store figures above are unaffected.
        </p>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Google Analytics didn&apos;t return data.</p>
          {ga4Problem?.error && (
            <p className="mt-1.5">
              Google says: <code className="rounded bg-amber-100 px-1 py-0.5">{ga4Problem.error}</code>
            </p>
          )}
          <p className="mt-1.5"><strong>Property ID:</strong> {ga4Problem?.propertyIdHint}</p>
          <p className="mt-1.5 text-amber-700">
            Most often this is one of: the <code>GA4_PROPERTY_ID</code> is the numeric Property ID
            (not the <code>G-…</code> Measurement ID); the service account{" "}
            <code>{process.env.GA4_CLIENT_EMAIL ?? "…"}</code> has been added to the GA4 property with{" "}
            <strong>Viewer</strong> access; and the <strong>Google Analytics Data API</strong> is
            enabled in the Cloud project.
          </p>
        </div>
      )}

      {/* COD fulfilment funnel */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Truck className="h-4 w-4 text-slate-400" /> Fulfilment
          </h2>
          <span className="text-sm">
            <span className="text-slate-500">Delivery rate </span>
            <span className="font-semibold text-slate-900">{deliveryRate}%</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Placed", value: orders, icon: ShoppingCart, tone: "text-slate-900" },
            { label: "Fulfilled", value: fulfilledCount, icon: PackageCheck, tone: "text-slate-900" },
            { label: "Delivered", value: deliveredCount, icon: Truck, tone: "text-[#3c6326]" },
            { label: "Cancelled", value: cancelledCount, icon: XCircle, tone: "text-[#d93025]" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</span>
                <s.icon className="h-4 w-4 text-slate-300" />
              </div>
              <div className={`mt-1 text-2xl font-semibold tabular-nums ${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Of orders placed in this period. Delivery rate climbs over time — recent orders may still be in transit (2–5 days).
        </p>
      </div>

      {/* Customer loyalty + cart recovery */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* New vs returning customers */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users className="h-4 w-4 text-slate-400" /> Customers
            </h2>
            <span className="text-sm">
              <span className="text-slate-500">Repeat rate </span>
              <span className="font-semibold text-slate-900">{repeatRate}%</span>
            </span>
          </div>
          {activeCust === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No customers in this period.</p>
          ) : (
            <>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full" style={{ width: `${(retCust / activeCust) * 100}%`, backgroundColor: ACCENT }} />
                <div className="h-full" style={{ width: `${(newCust / activeCust) * 100}%`, backgroundColor: "#bd8fb3" }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: "#bd8fb3" }} />
                    <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <UserPlus className="h-3.5 w-3.5" /> New
                    </span>
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{newCust}</div>
                  <div className="text-xs tabular-nums text-slate-500">{formatPKR(newRev)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
                    <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <Repeat className="h-3.5 w-3.5" /> Returning
                    </span>
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{retCust}</div>
                  <div className="text-xs tabular-nums text-slate-500">{formatPKR(retRev)}</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Buyers with an order in this period. &ldquo;Returning&rdquo; had ordered before it began.
              </p>
            </>
          )}
        </div>

        {/* Abandoned-cart recovery */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <RotateCcw className="h-4 w-4 text-slate-400" /> Cart recovery
            </h2>
            <span className="text-sm">
              <span className="text-slate-500">Recovery rate </span>
              <span className="font-semibold text-slate-900">{recoveryRate}%</span>
            </span>
          </div>
          {abTotal === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No abandoned carts in this period.</p>
          ) : (
            <>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full" style={{ width: `${(abRecovered / abTotal) * 100}%`, backgroundColor: POSITIVE }} />
                <div className="h-full" style={{ width: `${(abLost / abTotal) * 100}%`, backgroundColor: "#cbd5e1" }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: POSITIVE }} />
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Recovered</span>
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{abRecovered}</div>
                  <div className="text-xs tabular-nums text-slate-500">{formatPKR(abRecoveredVal)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Still lost</span>
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{abLost}</div>
                  <div className="text-xs tabular-nums text-slate-500">{formatPKR(abLostVal)}</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Carts abandoned in this period. Recovery nudges send at 1h and 24h, then stop after 7 days.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Breakdown tables */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-medium text-slate-500">Top products</h2>
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.title}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{p.title}</span>
                  <span className="tabular-nums text-slate-500">{p._sum.quantity} sold</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${((p._sum.quantity ?? 0) / maxQty) * 100}%`, backgroundColor: ACCENT }} />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-slate-400">No sales in this period.</p>}
          </div>
        </div>

        {/* Sales by city */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500">
            <MapPin className="h-4 w-4 text-slate-400" /> Sales by city
          </h2>
          <div className="space-y-4">
            {cities.map((c) => (
              <div key={c.city}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{c.city}</span>
                  <span className="tabular-nums text-slate-500">
                    {c.orders} order{c.orders === 1 ? "" : "s"} · {formatPKR(c.revenue)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${(c.revenue / maxCityRev) * 100}%`, backgroundColor: ACCENT }} />
                </div>
              </div>
            ))}
            {cities.length === 0 && <p className="text-sm text-slate-400">No orders in this period.</p>}
          </div>
        </div>

        {/* Payment methods */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-medium text-slate-500">Orders by payment method</h2>
          <div className="space-y-4">
            {byMethod.map((m) => {
              const label = getPaymentMethod(m.paymentMethod)?.label ?? m.paymentMethod;
              const pct = Math.round(((m._count._all ?? 0) / methodTotal) * 100);
              return (
                <div key={m.paymentMethod}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{label}</span>
                    <span className="tabular-nums text-slate-500">{m._count._all} · {formatPKR(m._sum.total ?? 0)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ACCENT }} />
                  </div>
                </div>
              );
            })}
            {byMethod.length === 0 && <p className="text-sm text-slate-400">No orders in this period.</p>}
          </div>
        </div>

        {/* Top Pages (GA4) */}
        {topPages.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-medium text-slate-500">
              Top pages <span className="font-normal text-slate-400">· Google Analytics</span>
            </h2>
            <div className="space-y-4">
              {topPages.map((p) => (
                <div key={p.path}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate text-slate-700">{p.path}</span>
                    <span className="ml-2 shrink-0 tabular-nums text-slate-500">{p.views.toLocaleString()} views</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${(p.views / maxPageViews) * 100}%`, backgroundColor: ACCENT }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Device breakdown (GA4) */}
        {devices.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-medium text-slate-500">
              Device breakdown <span className="font-normal text-slate-400">· Google Analytics</span>
            </h2>
            <div className="space-y-4">
              {devices.map((d) => {
                const pct = Math.round((d.sessions / totalDeviceSessions) * 100);
                return (
                  <div key={d.device}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-slate-700">{d.device}</span>
                      <span className="tabular-nums text-slate-500">{pct}% · {d.sessions.toLocaleString()} sessions</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ACCENT }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
