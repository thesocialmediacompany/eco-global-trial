import { formatDate } from "@/lib/dates";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, MapPin, ShoppingBag, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";


export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } },
    },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((s, o) => s + o.total, 0);
  const aov = customer.orders.length ? Math.round(totalSpent / customer.orders.length) : 0;
  const hasAccount = Boolean(customer.passwordHash);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-semibold text-purple-900">{customer.name}</h1>
          <p className="text-sm text-purple-900/50">
            Customer since {formatDate(customer.createdAt)}
            {hasAccount && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                Has account
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* profile + stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-purple-900">Contact</h2>
            <div className="space-y-2 text-sm text-purple-900/70">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-900/40" /> {customer.email}
              </p>
              {customer.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-900/40" /> {customer.phone}
                </p>
              )}
              {customer.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-900/40" />
                  <span>
                    {customer.address}
                    {customer.city && `, ${customer.city}`}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Stat icon={ShoppingBag} label="Orders" value={customer.orders.length.toString()} />
            <Stat icon={Wallet} label="Total spent" value={formatPKR(totalSpent)} />
            <Stat icon={Wallet} label="Avg order value" value={formatPKR(aov)} />
          </div>
        </div>

        {/* orders */}
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
          <h2 className="border-b border-purple-100 px-5 py-4 font-display text-base font-semibold text-purple-900">
            Order history
          </h2>
          {customer.orders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-purple-900/50">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Fulfillment</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((o) => (
                  <tr key={o.id} className="border-b border-purple-50 last:border-0 hover:bg-cream/40">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-purple-900 hover:text-purple-700"
                      >
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-purple-900/60">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-5 py-3"><StatusBadge status={o.fulfillmentStatus} /></td>
                    <td className="px-5 py-3 text-right font-medium text-purple-900">
                      {formatPKR(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-purple-900/50">{label}</span>
        <Icon className="h-4 w-4 text-green-600" />
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-purple-900">{value}</div>
    </div>
  );
}
