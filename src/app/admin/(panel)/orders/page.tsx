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

function whereFor(tab: string, q?: string): Prisma.OrderWhereInput {
  const search: Prisma.OrderWhereInput | undefined = q
    ? {
        OR: [
          { customerName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          // numeric search by order number
          ...(isNaN(Number(q.replace("#", "")))
            ? []
            : [{ orderNumber: Number(q.replace("#", "")) }]),
        ],
      }
    : undefined;

  const base: Prisma.OrderWhereInput = (() => {
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
  })();

  return search ? { AND: [base, search] } : base;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab = "all", q } = await searchParams;
  const where = whereFor(tab, q);

  const [orders, totalCount, itemsAgg, fulfilledCount, deliveredCount] =
    await Promise.all([
      prisma.order.findMany({
        where,
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
    <div className="mx-auto max-w-6xl">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Orders</h1>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50">
            <Download className="h-4 w-4" /> Export
          </button>
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-3.5 py-2 text-sm font-semibold text-cream"
          >
            <Plus className="h-4 w-4" /> Create order
          </Link>
        </div>
      </div>

      {/* metric summary bar */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-purple-100 bg-white px-5 py-4 shadow-sm">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col">
            <span className="text-xs text-purple-900/50">{m.label}</span>
            <span className="font-semibold text-purple-900">{m.value}</span>
          </div>
        ))}
      </div>

      {/* table card */}
      <div className="rounded-xl border border-purple-100 bg-white shadow-sm">
        {/* tabs + search status */}
        <div className="flex items-center gap-1 border-b border-purple-100 px-4 pt-3">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/orders?tab=${t.key}`}
              className={`rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-purple-600 text-purple-900"
                  : "text-purple-900/50 hover:text-purple-900"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {q && (
          <div className="flex items-center gap-2 border-b border-purple-100 bg-purple-50 px-5 py-2.5 text-sm text-purple-900/70">
            <Search className="h-4 w-4" />
            Showing results for <strong>&ldquo;{q}&rdquo;</strong>
            <Link href="/admin/orders" className="ml-auto text-xs text-purple-600 hover:underline">
              Clear
            </Link>
          </div>
        )}

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

        <p className="border-t border-purple-100 px-5 py-3 text-xs text-purple-900/50">
          Showing {orders.length} order{orders.length === 1 ? "" : "s"}
          {q && ` matching "${q}"`}
        </p>
      </div>
    </div>
  );
}