import Link from "next/link";
import { ShoppingCart, Package, Users, TrendingUp, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminDashboard() {
  const [orderCount, productCount, customerCount, paidAgg, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "paid" },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { items: true } } },
      }),
    ]);

  const revenue = paidAgg._sum.total ?? 0;

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
          <div
            key={s.label}
            className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm"
          >
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

      {/* Recent orders */}
      <div className="mt-8 rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-purple-900">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-purple-900/50">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Fulfillment</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-purple-50 last:border-0 hover:bg-cream/40"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-purple-900 hover:text-purple-700"
                      >
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-purple-900/80">{o.customerName}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.fulfillmentStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-purple-900">
                      {formatPKR(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
