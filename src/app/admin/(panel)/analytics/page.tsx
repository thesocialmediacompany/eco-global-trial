import { TrendingUp, ShoppingCart, Package, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { formatPKR } from "@/lib/utils";
import { getPaymentMethod } from "@/lib/payments";

export default async function AnalyticsPage() {
  await requireOwner();
  const [orders, revenueAgg, itemsAgg, topProducts, byMethod] = await Promise.all([
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
  ]);

  const revenue = revenueAgg._sum.total ?? 0;
  const totalOrders = orders;
  const aov = totalOrders ? Math.round(revenue / totalOrders) : 0;
  const maxQty = Math.max(1, ...topProducts.map((p) => p._sum.quantity ?? 0));
  const methodTotal = Math.max(
    1,
    byMethod.reduce((s, m) => s + (m._count._all ?? 0), 0),
  );

  const stats = [
    { label: "Revenue (paid)", value: formatPKR(revenue), icon: TrendingUp },
    { label: "Orders", value: totalOrders.toString(), icon: ShoppingCart },
    { label: "Avg order value", value: formatPKR(aov), icon: Receipt },
    { label: "Items sold", value: (itemsAgg._sum.quantity ?? 0).toString(), icon: Package },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-display text-2xl font-semibold text-purple-900">Analytics</h1>

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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* top products */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">
            Top products
          </h2>
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

        {/* payment methods */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-display text-lg font-semibold text-purple-900">
            Orders by payment method
          </h2>
          <div className="space-y-4">
            {byMethod.map((m) => {
              const label = getPaymentMethod(m.paymentMethod)?.label ?? m.paymentMethod;
              const pct = Math.round(((m._count._all ?? 0) / methodTotal) * 100);
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
      </div>
    </div>
  );
}
