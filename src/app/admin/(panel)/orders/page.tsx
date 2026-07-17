import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Download, Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { bulkFulfillOrders } from "./actions";

const PAGE_SIZE = 50;

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
  { key: "unfulfilled", label: "Unfulfilled" },
  { key: "unpaid", label: "Unpaid" },
  { key: "fulfilled", label: "Fulfilled" },
  { key: "archived", label: "Archived" },
  { key: "drafts", label: "Drafts" },
];

function whereFor(tab: string, q?: string): Prisma.OrderWhereInput {
  const search: Prisma.OrderWhereInput | undefined = q
    ? {
        OR: [
          { customerName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { tags: { contains: q, mode: "insensitive" } },
          { trackingNumber: { contains: q, mode: "insensitive" } },
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
        return { isDraft: false, fulfillmentStatus: "unfulfilled", archivedAt: null };
      case "unpaid":
        return { isDraft: false, paymentStatus: "pending", archivedAt: null };
      case "fulfilled":
        return { isDraft: false, fulfillmentStatus: "fulfilled", archivedAt: null };
      case "archived":
        return { isDraft: false, archivedAt: { not: null } };
      default:
        // Like Shopify, the default list is the working set: archived orders
        // are put away rather than deleted, so they're excluded here.
        return { isDraft: false, archivedAt: null };
    }
  })();

  return search ? { AND: [base, search] } : base;
}

/** Midnight today, in the store's local reckoning. */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}) {
  const { tab = "all", q, page } = await searchParams;
  const where = whereFor(tab, q);
  const current = Math.max(1, Number(page) || 1);
  const since = startOfToday();

  const [orders, matching, todayOrders, todayItems, todayFulfilled, todayDelivered, todayRefunds] =
    await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } } },
        skip: (current - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { isDraft: false, createdAt: { gte: since } } }),
      prisma.orderItem.aggregate({
        where: { order: { isDraft: false, createdAt: { gte: since } } },
        _sum: { quantity: true },
      }),
      prisma.order.count({
        where: { isDraft: false, fulfillmentStatus: "fulfilled", createdAt: { gte: since } },
      }),
      prisma.order.count({
        where: { isDraft: false, deliveredAt: { gte: since } },
      }),
      prisma.order.aggregate({
        where: { isDraft: false, paymentStatus: "refunded", createdAt: { gte: since } },
        _sum: { total: true },
      }),
    ]);

  // Shopify's bar is scoped to a period, not all time. Ours is Today.
  const metrics = [
    { label: "Orders", value: todayOrders.toString() },
    { label: "Items ordered", value: (todayItems._sum.quantity ?? 0).toString() },
    { label: "Sales reversals", value: formatPKR(todayRefunds._sum.total ?? 0) },
    { label: "Orders fulfilled", value: todayFulfilled.toString() },
    { label: "Orders delivered", value: todayDelivered.toString() },
  ];

  const totalPages = Math.max(1, Math.ceil(matching / PAGE_SIZE));
  const from = matching === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, matching);
  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (tab !== "all") sp.set("tab", tab);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Orders</h1>
        <div className="flex gap-2">
          <a
            href="/api/admin/orders/export"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
          >
            <Download className="h-4 w-4" /> Export
          </a>
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-3.5 py-2 text-sm font-semibold text-cream"
          >
            <Plus className="h-4 w-4" /> Create order
          </Link>
        </div>
      </div>

      {/* metric summary bar */}
      <div className="mb-5 flex flex-wrap items-stretch divide-x divide-purple-100 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-purple-900">
          <Calendar className="h-4 w-4 text-purple-900/40" /> Today
        </div>
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-1 flex-col justify-center px-5 py-4">
            <span className="text-xs font-medium text-purple-900/50">{m.label}</span>
            <span className="mt-0.5 font-display text-lg font-semibold text-purple-900">
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* table card */}
      <div className="rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b border-purple-100 px-4 pt-3">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.key === "all" ? "/admin/orders" : `/admin/orders?tab=${t.key}`}
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

        <div className="border-b border-purple-100 px-4 py-3">
          <AdminSearch
            placeholder="Search order, customer, phone, tag or tracking"
            defaultValue={q}
            className="max-w-md"
            hidden={tab !== "all" ? { tab } : undefined}
          />
        </div>

        <OrdersTable
          orders={orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            date: formatDate(o.createdAt),
            channel: o.isDraft ? "Draft" : "Online Store",
            total: o.total,
            paymentStatus: o.paymentStatus,
            fulfillmentStatus: o.fulfillmentStatus,
            itemCount: o._count.items,
            deliveryStatus: o.deliveredAt
              ? "Delivered"
              : o.courierStatus || (o.trackingNumber ? "Tracking added" : ""),
            deliveryMethod: o.shippingMethod,
          }))}
          bulkFulfill={bulkFulfillOrders}
        />

        {/* pagination */}
        <div className="flex items-center justify-between gap-3 border-t border-purple-100 px-4 py-3">
          <p className="text-xs text-purple-900/50">
            {matching === 0 ? "No orders" : `${from}-${to} of ${matching}`}
            {q && ` matching "${q}"`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Link
                href={pageHref(current - 1)}
                aria-disabled={current === 1}
                aria-label="Previous page"
                className={`grid h-8 w-8 place-items-center rounded-lg border border-purple-200 text-purple-900/70 ${
                  current === 1 ? "pointer-events-none opacity-40" : "hover:bg-purple-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <span className="px-2 text-xs text-purple-900/60">
                {current} / {totalPages}
              </span>
              <Link
                href={pageHref(current + 1)}
                aria-disabled={current >= totalPages}
                aria-label="Next page"
                className={`grid h-8 w-8 place-items-center rounded-lg border border-purple-200 text-purple-900/70 ${
                  current >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-purple-50"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
