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
  BarChart3,
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

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
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

function presetDays(range: string) {
  const m = /^(\d+)daysAgo$/.exec(range);
  return m ? Number(m[1]) : 30;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** ▲/▼ % vs the previous equal period. Everything here is "up = good". */
function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev <= 0) {
    return cur > 0 ? <span className="text-xs font-semibold text-green-600">new</span> : null;
  }
  const pct = Math.round(((cur - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-green-600" : "text-rose-600"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
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
    ga4,
    topPages,
    devices,
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
    getGA4Overview(pktDay(start), pktDay(end)),
    getGA4TopPages(pktDay(start), pktDay(end)),
    getGA4DeviceBreakdown(pktDay(start), pktDay(end)),
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

  // Revenue trend: daily for short ranges, weekly / monthly for long ones.
  const days = Math.round(lenMs / DAY_MS);
  const binDays = days <= 31 ? 1 : days <= 180 ? 7 : 30;
  const binMs = binDays * DAY_MS;
  const nBins = Math.max(1, Math.ceil(lenMs / binMs));
  const bins = Array.from({ length: nBins }, (_, i) => ({
    start: new Date(start.getTime() + i * binMs),
    revenue: 0,
  }));
  for (const r of rows) {
    const idx = Math.min(nBins - 1, Math.max(0, Math.floor((r.createdAt.getTime() - start.getTime()) / binMs)));
    bins[idx].revenue += r.total;
  }
  const maxBin = Math.max(1, ...bins.map((b) => b.revenue));
  const binLabel = binDays === 1 ? "day" : binDays === 7 ? "week" : "month";

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
    <div className="mx-auto max-w-6xl">
      {/* Header + range */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Analytics</h1>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <Link
              key={p.value}
              href={`?range=${p.value}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                range === p.value && !custom
                  ? "bg-purple-900 text-white"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              {p.label}
            </Link>
          ))}
          <form method="GET" className="flex items-center gap-1">
            <input type="date" name="from" defaultValue={params.from ?? ""}
              className="rounded-lg border border-purple-100 px-2 py-1 text-xs text-purple-900 outline-none focus:border-purple-300" />
            <span className="text-xs text-purple-900/50">to</span>
            <input type="date" name="to" defaultValue={params.to ?? ""}
              className="rounded-lg border border-purple-100 px-2 py-1 text-xs text-purple-900 outline-none focus:border-purple-300" />
            <button type="submit"
              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700">
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Store stats — now scoped to the selected range */}
      <div className="mb-2 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-green-600" />
        <span className="text-xs font-semibold uppercase tracking-wide text-purple-900/50">
          Store · {rangeLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {storeStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-purple-900/50">{s.label}</span>
              <s.icon className="h-4 w-4 text-green-600" />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold text-purple-900">{s.value}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <Delta cur={s.cur} prev={s.prev} />
              <span className="text-xs text-purple-900/40">vs previous period</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-purple-900/40">
        Sales counts the value of orders placed in the period (cash-on-delivery included).
      </p>

      {/* Revenue trend */}
      <div className="mt-6 rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
            <BarChart3 className="h-4 w-4 text-green-600" /> Revenue trend
          </h2>
          <span className="text-xs text-purple-900/50">per {binLabel} · {formatPKR(grossSales)} total</span>
        </div>
        {orders === 0 ? (
          <p className="py-10 text-center text-sm text-purple-900/45">No orders in this period.</p>
        ) : (
          <>
            <div className="flex h-44 items-end gap-1">
              {bins.map((b, i) => (
                <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t gradient-purple-green transition-all"
                    style={{ height: `${Math.max(2, (b.revenue / maxBin) * 100)}%` }}
                    title={`${fmtShort(b.start)}: ${formatPKR(b.revenue)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[0.65rem] text-purple-900/40">
              <span>{fmtShort(bins[0].start)}</span>
              <span>{fmtShort(bins[bins.length - 1].start)}</span>
            </div>
          </>
        )}
      </div>

      {/* GA4 */}
      {ga4 ? (
        <>
          <div className="mt-6 mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-purple-900/50">
              Google Analytics · {rangeLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Users",        value: ga4.users.toLocaleString(),          icon: Users },
              { label: "Sessions",     value: ga4.sessions.toLocaleString(),       icon: TrendingUp },
              { label: "Page Views",   value: ga4.pageViews.toLocaleString(),      icon: Eye },
              { label: "Avg Duration", value: fmtDuration(ga4.avgSessionDuration), icon: Monitor },
              { label: "Bounce Rate",  value: `${ga4.bounceRate}%`,                icon: Globe },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-purple-900/50">{s.label}</span>
                  <s.icon className="h-4 w-4 text-purple-400" />
                </div>
                <div className="mt-2 font-display text-2xl font-semibold text-purple-900">{s.value}</div>
              </div>
            ))}
          </div>
        </>
      ) : !ga4Configured() ? (
        <p className="mt-6 rounded-xl border border-purple-100 bg-cream/50 px-4 py-3 text-sm text-purple-900/70">
          Google Analytics isn&apos;t connected yet. Add <code>GA4_PROPERTY_ID</code>,{" "}
          <code>GA4_CLIENT_EMAIL</code> and <code>GA4_PRIVATE_KEY</code> in AWS Amplify
          (Hosting → Environment variables) and redeploy. Your store figures above are unaffected.
        </p>
      ) : (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">Top products</h2>
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.title}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-purple-900">{p.title}</span>
                  <span className="text-purple-900/60">{p._sum.quantity} sold</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                  <div className="h-full rounded-full gradient-purple-green"
                    style={{ width: `${((p._sum.quantity ?? 0) / maxQty) * 100}%` }} />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-purple-900/50">No sales in this period.</p>}
          </div>
        </div>

        {/* Sales by city */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
            <MapPin className="h-4 w-4 text-green-600" /> Sales by city
          </h2>
          <div className="space-y-4">
            {cities.map((c) => (
              <div key={c.city}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-purple-900">{c.city}</span>
                  <span className="text-purple-900/60">
                    {c.orders} order{c.orders === 1 ? "" : "s"} · {formatPKR(c.revenue)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                  <div className="h-full rounded-full gradient-green"
                    style={{ width: `${(c.revenue / maxCityRev) * 100}%` }} />
                </div>
              </div>
            ))}
            {cities.length === 0 && <p className="text-sm text-purple-900/50">No orders in this period.</p>}
          </div>
        </div>

        {/* Payment methods */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">Orders by payment method</h2>
          <div className="space-y-4">
            {byMethod.map((m) => {
              const label = getPaymentMethod(m.paymentMethod)?.label ?? m.paymentMethod;
              const pct = Math.round(((m._count._all ?? 0) / methodTotal) * 100);
              return (
                <div key={m.paymentMethod}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-purple-900">{label}</span>
                    <span className="text-purple-900/60">{m._count._all} · {formatPKR(m._sum.total ?? 0)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                    <div className="h-full rounded-full gradient-green" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {byMethod.length === 0 && <p className="text-sm text-purple-900/50">No orders in this period.</p>}
          </div>
        </div>

        {/* Top Pages (GA4) */}
        {topPages.length > 0 && (
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">
              Top pages <span className="text-sm font-normal text-purple-900/40">(GA4)</span>
            </h2>
            <div className="space-y-4">
              {topPages.map((p) => (
                <div key={p.path}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate text-purple-900">{p.path}</span>
                    <span className="ml-2 shrink-0 text-purple-900/60">{p.views.toLocaleString()} views</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                    <div className="h-full rounded-full bg-purple-400"
                      style={{ width: `${(p.views / maxPageViews) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Device breakdown (GA4) */}
        {devices.length > 0 && (
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">
              Device breakdown <span className="text-sm font-normal text-purple-900/40">(GA4)</span>
            </h2>
            <div className="space-y-4">
              {devices.map((d) => {
                const pct = Math.round((d.sessions / totalDeviceSessions) * 100);
                return (
                  <div key={d.device}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-purple-900">{d.device}</span>
                      <span className="text-purple-900/60">{pct}% · {d.sessions.toLocaleString()} sessions</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                      <div className="h-full rounded-full gradient-green" style={{ width: `${pct}%` }} />
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
