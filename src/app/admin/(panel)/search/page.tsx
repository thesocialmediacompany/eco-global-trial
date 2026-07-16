import Link from "next/link";
import Image from "next/image";
import { Package, Users, ShoppingCart, Search as SearchIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Search" };

/**
 * Global dashboard search. The top-bar search box points here, and it queries
 * products, customers and orders at once, showing grouped results that link to
 * each record. Each list page also keeps its own scoped search.
 */
export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  if (!term) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Search</h1>
        <p className="m-1 mt-1 text-sm text-purple-900/60">
          Search across products, customers and orders.
        </p>
        <div className="mt-5">
          <AdminSearch placeholder="Search products, customers, orders…" />
        </div>
        <p className="mt-6 text-sm text-purple-900/50">
          Type a product name, customer name, email, phone or order number.
        </p>
      </div>
    );
  }

  const orderNum = Number(term.replace(/^#/, ""));
  const [products, customers, orders] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { collection: { name: { contains: term, mode: "insensitive" } } },
        ],
      },
      include: { collection: true },
      take: 25,
    }),
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
          { phone: { contains: term, mode: "insensitive" } },
          { city: { contains: term, mode: "insensitive" } },
        ],
      },
      include: { orders: { select: { id: true } } },
      take: 25,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { customerName: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
          { phone: { contains: term, mode: "insensitive" } },
          ...(Number.isNaN(orderNum) ? [] : [{ orderNumber: orderNum }]),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const totalHits = products.length + customers.length + orders.length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">Search</h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {totalHits} result{totalHits === 1 ? "" : "s"} for{" "}
            <strong>&ldquo;{term}&rdquo;</strong>
          </p>
        </div>
        <AdminSearch defaultValue={term} placeholder="Search products, customers, orders…" />
      </div>

      {totalHits === 0 && (
        <div className="rounded-xl border border-purple-100 bg-white p-10 text-center text-sm text-purple-900/60 shadow-sm">
          <SearchIcon className="mx-auto mb-3 h-6 w-6 text-purple-900/30" />
          Nothing matched &ldquo;{term}&rdquo;. Try a different name, email, phone or order number.
        </div>
      )}

      <div className="space-y-6">
        {/* Products */}
        {products.length > 0 && (
          <Group icon={Package} title="Products" count={products.length} href={`/admin/products?q=${encodeURIComponent(term)}`}>
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center gap-3 border-b border-purple-50 px-4 py-3 last:border-0 hover:bg-cream/40"
              >
                <span className={`relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg text-lg ${p.imageUrl ? "bg-white" : p.gradient}`}>
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.title} fill sizes="36px" className="object-cover" />
                  ) : (
                    p.emoji
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-purple-900">{p.title}</span>
                  <span className="text-xs text-purple-900/50">{p.collection?.name ?? "No collection"}</span>
                </span>
                <span className="text-sm font-medium text-purple-900">{formatPKR(p.price)}</span>
              </Link>
            ))}
          </Group>
        )}

        {/* Customers */}
        {customers.length > 0 && (
          <Group icon={Users} title="Customers" count={customers.length} href={`/admin/customers?q=${encodeURIComponent(term)}`}>
            {customers.map((c) => (
              <Link
                key={c.id}
                href={`/admin/customers/${c.id}`}
                className="flex items-center gap-3 border-b border-purple-50 px-4 py-3 last:border-0 hover:bg-cream/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-purple-900">{c.name}</span>
                  <span className="truncate text-xs text-purple-900/50">{c.email}{c.phone ? ` · ${c.phone}` : ""}</span>
                </span>
                <span className="text-xs text-purple-900/60">{c.orders.length} order{c.orders.length === 1 ? "" : "s"}</span>
              </Link>
            ))}
          </Group>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <Group icon={ShoppingCart} title="Orders" count={orders.length} href={`/admin/orders?q=${encodeURIComponent(term)}`}>
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center gap-3 border-b border-purple-50 px-4 py-3 last:border-0 hover:bg-cream/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-purple-900">
                    #{o.orderNumber} · {o.customerName}
                  </span>
                  <span className="truncate text-xs text-purple-900/50">{o.email || o.phone}</span>
                </span>
                <StatusBadge status={o.fulfillmentStatus} />
                <span className="text-sm font-medium text-purple-900">{formatPKR(o.total)}</span>
              </Link>
            ))}
          </Group>
        )}
      </div>
    </div>
  );
}

function Group({
  icon: Icon,
  title,
  count,
  href,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-purple-100 px-4 py-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-purple-900">
          <Icon className="h-4 w-4 text-green-600" /> {title}
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">{count}</span>
        </h2>
        <Link href={href} className="text-xs font-medium text-green-700 hover:underline">
          View all
        </Link>
      </div>
      <div>{children}</div>
    </div>
  );
}
