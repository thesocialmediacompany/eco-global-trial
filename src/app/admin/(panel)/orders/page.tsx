import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Download, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { bulkFulfillOrders } from "./actions";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

const tabs = [
  { key: "all", label: "All" },
  { key: "drafts", label: "Drafts" },
  { key: "unfulfilled", label: "Unfulfilled" },
  { key: "unpaid", label: "Unpaid" },
  { key: "fulfilled", label: "Fulfilled" },
];

function whereFor(tab: string): Prisma.OrderWhereInput {
  switch (tab) {
    case "drafts":
      return { isDraft: true };
    case "unfulfilled":
      return { isDraft: false, fulfillmentStatus: "unfulfilled" };
    case "unpaid":
      return { isDraft: false, paymentStatus: "pending" };
    case "fulfilled":
      return { isDraft: false, fulfillmentStatus: "fulfilled" };
    default:
      return { isDraft: false };
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "all" } = await searchParams;

  const [orders, totalCount, itemsAgg, fulfilledCount, deliveredCount] =
    await Promise.all([
      prisma.order.findMany({
        where: whereFor(tab),
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } } },
      }),
      prisma.order.count(),
      prisma.orderItem.aggregate({ _sum: { quantity: true } }),
      prisma.order.count({ where: { fulfillmentStatus: "fulfilled" } }),
      prisma.order.count({ where: { courier: { not: "" } } }),
    ]);

  const metrics = [
    { label: "Orders", value: totalCount.toString() },
    { label: "Items ordered", value: (itemsAgg._sum.quantity ?? 0).toString() },
    { label: "Returns", value: "Rs 0" },
    { label: "Orders fulfilled", value: fulfilledCount.toString() },
    { label: "Orders delivered", value: deliveredCount.toString() },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Orders</h1>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/orders/export"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-medium text-purple-900 hover:bg-purple-50"
          >
            <Download className="h-4 w-4" /> Export
          </a>
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-3.5 py-2 text-sm font-semibold text-cream hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> Create order
          </Link>
        </div>
      </div>

      {/* metric summary bar */}
      <div className="mb-5 grid grid-cols-2 divide-purple-100 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
        {metrics.map((m) => (
          <div key={m.label} className="px-5 py-4">
            <p className="text-xs font-medium text-purple-900/50">{m.label}</p>
            <p className="mt-1 font-display text-xl font-semibold text-purple-900">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* table card */}
      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        {/* tabs + search */}
        <div className="flex flex-wrap items-center gap-3 border-b border-purple-100 px-4 py-3">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={`/admin/orders?tab=${t.key}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.key
                    ? "bg-purple-100 text-purple-900"
                    : "text-purple-900/60 hover:bg-purple-50"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-900/40" />
            <input
              placeholder="Search and filter"
              className="w-full rounded-lg border border-purple-100 bg-cream/50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-purple-300 focus:bg-white"
            />
          </div>
        </div>

        <OrdersTable
          orders={orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            date: formatDate(o.createdAt),
            total: o.total,
            paymentStatus: o.paymentStatus,
            fulfillmentStatus: o.fulfillmentStatus,
            itemCount: o._count.items,
            hasCourier: Boolean(o.courier),
          }))}
          bulkFulfill={bulkFulfillOrders}
        />

        <div className="flex items-center justify-between border-t border-purple-100 px-4 py-3 text-sm text-purple-900/50">
          <span>
            Showing {orders.length} order{orders.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
