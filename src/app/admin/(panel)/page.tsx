import Link from "next/link";
import { ShoppingCart, Package, Users, TrendingUp, ArrowRight, AlertTriangle, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

const LOW_STOCK_THRESHOLD = 10;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminDashboard() {
  const since = new Date();
  since.setDate(since.getDate() - 13); // 14-day window incl. today
  since.setHours(0, 0, 0, 0);

  const [
    orderCount,
    productCount,
    customerCount,
    paidAgg,
    recentOrders,
    windowOrders,
    lowStock,
    topItems,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since }, isDraft: false },
      select: { createdAt: true, total: true },
    }),
    prisma.variant.findMany({
      where: { available: true, inventoryQty: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { inventoryQty: "asc" },
      take: 8,
      include: { product: { select: { slug: true, title: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "title"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const revenue = paidAgg._sum.total ?? 0;

  // 14-day daily revenue buckets
  const days: { label: string; key: string; revenue: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
      revenue: 0,
    });
  }
  for (const o of windowOrders) {
    const k = dayKey(o.createdAt);
    const bucket = days.find((d) => d.key === k);
    if (bucket) bucket.revenue += o.total;
  }
  const maxRev = Math.max(1, ...days.map((d) => d.revenue));
  const windowTotal = days.reduce((s, d) => s + d.revenue, 0);

  const stats = [
    { label: "Revenue (paid)", value: formatPKR(revenue), icon: TrendingUp },
    { label: "Orders", value: orderCount.toString(), icon: ShoppingCart },
    { label: "Products", value: productCount.toString(), icon: Package },
    { label: "Customers", value: customerCount.toString(), icon: Users },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">
            Good morning, EGF Admin 👋
          </h1>
          <p className="mt-1 text-sm text-purple-900/60">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="hidden rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream shadow-sm transition hover:opacity-95 sm:block"
        >
          Add product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
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

      {/* Sales chart + low stock */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-purple-900">
              <BarChart3 className="h-4 w-4 text-green-600" /> Sales · last 14 days
            </h2>
            <span className="text-sm font-semibold text-purple-900">{formatPKR(windowTotal)}</span>
          </div>
          <div className="flex h-40 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="group relative flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-t gradient-purple-green transition-all"
                  style={{ height: `${Math.max(2, (d.revenue / maxRev) * 100)}%` }}
                  title={`${d.label}: ${formatPKR(d.revenue)}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.65rem] text-purple-900/40">
            <span>{days[0].label}</span>
            <span>{days[days.length - 1].label}</span>
          </div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-purple-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock
          </h2>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-purple-900/50">
              Everything&apos;s well stocked. 🎉
            </p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link
                    href={`/admin/products`}
                    className="min-w-0 flex-1 truncate text-purple-900 hover:text-purple-700"
                    title={v.product.title}
                  >
                    {v.product.title}
                    {v.title && v.title !== "Default" ? ` · ${v.title}` : ""}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      v.inventoryQty === 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {v.inventoryQty} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top products + recent orders */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-display text-base font-semibold text-purple-900">
            Top sellers
          </h2>
          {topItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-purple-900/50">No sales yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {topItems.map((t, i) => (
                <li key={`${t.productId}-${i}`} className="flex items-center gap-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-purple-900">{t.title}</span>
                  <span className="shrink-0 text-purple-900/60">{t._sum.quantity ?? 0} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-xl border border-purple-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
            <h2 className="font-display text-base font-semibold text-purple-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-purple-900/50">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-purple-50">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-semibold text-purple-900 hover:text-purple-700"
                  >
                    #{o.orderNumber}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-sm text-purple-900/70">
                    {o.customerName}
                  </span>
                  <StatusBadge status={o.fulfillmentStatus} />
                  <span className="shrink-0 text-sm font-medium text-purple-900">
                    {formatPKR(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
