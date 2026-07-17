import Link from "next/link";
import { TrendingUp, ShoppingCart, Package, Receipt, Users, Eye, Globe, Monitor } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { formatPKR } from "@/lib/utils";
import { getPaymentMethod } from "@/lib/payments";
import {
  getGA4Overview,
  getGA4TopPages,
  getGA4DeviceBreakdown,
  ga4Configured,
} from "@/lib/ga4";

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
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

  const startDate = params.from ?? range;
  const endDate   = params.to   ?? "today";

  const [orders, revenueAgg, itemsAgg, topProducts, byMethod, ga4, topPages, devices] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
      prisma.orderItem.aggregate({ _sum: { quantity: true } }),
      prisma.orderItem.groupBy({
        by: ["title"],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 6,
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        _count: { _all: true },
        _sum: { total: true },
      }),
      getGA4Overview(startDate, endDate),
      getGA4TopPages(startDate, endDate),
      getGA4DeviceBreakdown(startDate, endDate),
    ]);

  const revenue     = revenueAgg._sum.total ?? 0;
  const totalOrders = orders;
  const aov         = totalOrders ? Math.round(revenue / totalOrders) : 0;
  const maxQty      = Math.max(1, ...topProducts.map((p) => p._sum.quantity ?? 0));
  const methodTotal = Math.max(1, byMethod.reduce((s, m) => s + (m._count._all ?? 0), 0));
  const totalDeviceSessions = Math.max(1, devices.reduce((s, d) => s + d.sessions, 0));
  const maxPageViews = Math.max(1, ...topPages.map((p) => p.views));

  const storeStats = [
    { label: "Revenue (paid)",  value: formatPKR(revenue),                          icon: TrendingUp },
    { label: "Orders",          value: totalOrders.toString(),                       icon: ShoppingCart },
    { label: "Avg order value", value: formatPKR(aov),                              icon: Receipt },
    { label: "Items sold",      value: (itemsAgg._sum.quantity ?? 0).toString(),    icon: Package },
  ];

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header + Date Range Selector */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Analytics</h1>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <Link
              key={p.value}
              href={`?range=${p.value}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                range === p.value && !params.from
                  ? "bg-purple-900 text-white"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              {p.label}
            </Link>
          ))}
          <form method="GET" className="flex items-center gap-1">
            <input
              type="date"
              name="from"
              defaultValue={params.from ?? ""}
              className="rounded-lg border border-purple-100 px-2 py-1 text-xs text-purple-900 outline-none focus:border-purple-300"
            />
            <span className="text-xs text-purple-900/50">to</span>
            <input
              type="date"
              name="to"
              defaultValue={params.to ?? ""}
              className="rounded-lg border border-purple-100 px-2 py-1 text-xs text-purple-900 outline-none focus:border-purple-300"
            />
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Store Stats — always all-time; the range selector only drives GA4. */}
      <div className="mb-2 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-green-600" />
        <span className="text-xs font-semibold uppercase tracking-wide text-purple-900/50">
          Store · all time
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {storeStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-purple-900/50">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-green-600" />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold text-purple-900">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* GA4 Stats */}
      {ga4 ? (
        <>
          <div className="mt-4 mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-purple-900/50">
              Google Analytics · {params.from ? `${params.from} → ${endDate}` : presets.find(p => p.value === range)?.label ?? "30 days"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Users",        value: ga4.users.toLocaleString(),         icon: Users    },
              { label: "Sessions",     value: ga4.sessions.toLocaleString(),      icon: TrendingUp },
              { label: "Page Views",   value: ga4.pageViews.toLocaleString(),     icon: Eye      },
              { label: "Avg Duration", value: fmtDuration(ga4.avgSessionDuration), icon: Monitor },
              { label: "Bounce Rate",  value: `${ga4.bounceRate}%`,              icon: Globe    },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-purple-900/50">
                    {s.label}
                  </span>
                  <s.icon className="h-4 w-4 text-purple-400" />
                </div>
                <div className="mt-2 font-display text-2xl font-semibold text-purple-900">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : !ga4Configured() ? (
        <p className="mt-4 rounded-xl border border-purple-100 bg-cream/50 px-4 py-3 text-sm text-purple-900/70">
          Google Analytics isn&apos;t connected yet. Add <code>GA4_PROPERTY_ID</code>,{" "}
          <code>GA4_CLIENT_EMAIL</code> and <code>GA4_PRIVATE_KEY</code> in AWS Amplify
          (Hosting → Environment variables) and redeploy. Your store figures above are
          unaffected.
        </p>
      ) : (
        <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Google Analytics is connected but returned no data for this range. If you
          picked custom dates, check the range is valid and in the past. The server log
          has the underlying error.
        </p>
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
                  <div
                    className="h-full rounded-full gradient-purple-green"
                    style={{ width: `${((p._sum.quantity ?? 0) / maxQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-purple-900/50">No sales data yet.</p>
            )}
          </div>
        </div>

        {/* Payment methods */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">
            Orders by payment method
          </h2>
          <div className="space-y-4">
            {byMethod.map((m) => {
              const label = getPaymentMethod(m.paymentMethod)?.label ?? m.paymentMethod;
              const pct   = Math.round(((m._count._all ?? 0) / methodTotal) * 100);
              return (
                <div key={m.paymentMethod}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-purple-900">{label}</span>
                    <span className="text-purple-900/60">
                      {m._count._all} · {formatPKR(m._sum.total ?? 0)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                    <div
                      className="h-full rounded-full gradient-green"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {byMethod.length === 0 && (
              <p className="text-sm text-purple-900/50">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Top Pages */}
        {topPages.length > 0 && (
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">
              Top pages{" "}
              <span className="text-sm font-normal text-purple-900/40">(GA4)</span>
            </h2>
            <div className="space-y-4">
              {topPages.map((p) => (
                <div key={p.path}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate text-purple-900">{p.path}</span>
                    <span className="ml-2 shrink-0 text-purple-900/60">
                      {p.views.toLocaleString()} views
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                    <div
                      className="h-full rounded-full bg-purple-400"
                      style={{ width: `${(p.views / maxPageViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Device breakdown */}
        {devices.length > 0 && (
          <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">
              Device breakdown{" "}
              <span className="text-sm font-normal text-purple-900/40">(GA4)</span>
            </h2>
            <div className="space-y-4">
              {devices.map((d) => {
                const pct = Math.round((d.sessions / totalDeviceSessions) * 100);
                return (
                  <div key={d.device}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-purple-900">{d.device}</span>
                      <span className="text-purple-900/60">
                        {pct}% · {d.sessions.toLocaleString()} sessions
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                      <div
                        className="h-full rounded-full gradient-green"
                        style={{ width: `${pct}%` }}
                      />
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