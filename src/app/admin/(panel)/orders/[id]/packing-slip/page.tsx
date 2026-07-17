import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatPKR } from "@/lib/utils";
import { getPaymentMethod } from "@/lib/payments";
import { PrintButton } from "@/components/admin/PrintButton";
import { BrandMark } from "@/components/site/BrandMark";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function PackingSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) notFound();

  const payment = getPaymentMethod(order.paymentMethod)?.label ?? order.paymentMethod;

  /* The rider needs one number: how much cash to take. Anything already paid
     must read as "collect nothing" so it can't be charged twice. */
  const isPaid = order.paymentStatus === "paid";
  const amountToCollect = isPaid ? 0 : order.total;
  const unitCount = order.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="mx-auto max-w-2xl print:max-w-none">
      {/* toolbar (hidden when printing) */}
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-purple-900/70 hover:text-purple-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back to order
        </Link>
        <PrintButton />
      </div>

      {/* the slip */}
      <div className="rounded-xl border border-purple-100 bg-white p-8 text-purple-900 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-purple-100 pb-5">
          <div className="flex items-start gap-3">
            <BrandMark className="h-11 w-11 shrink-0" rounded />
            <div>
              <h1 className="font-display text-2xl font-semibold">{settings.storeName}</h1>
              <p className="text-sm text-purple-900/60">{settings.storeLegalName}</p>
              <p className="mt-1 text-xs text-purple-900/50">
                {settings.storePhone} · {settings.storeEmail}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-semibold">Packing Slip</p>
            <p className="font-mono text-lg font-bold tracking-tight">#{order.orderNumber}</p>
            <p className="text-xs text-purple-900/50">{formatDate(order.createdAt)}</p>
            <p className="mt-1 text-xs text-purple-900/50">
              {order.items.length} {order.items.length === 1 ? "line" : "lines"} · {unitCount}{" "}
              {unitCount === 1 ? "unit" : "units"}
            </p>
          </div>
        </div>

        {/* The single number the rider acts on. */}
        <div
          className={`mt-5 flex items-center justify-between rounded-lg border-2 px-4 py-3 print-keep ${
            amountToCollect > 0
              ? "border-purple-900 bg-cream/60 print:bg-transparent"
              : "border-green-600 bg-green-50 print:bg-transparent"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-widest">
            {amountToCollect > 0 ? "Collect on delivery" : "Already paid · collect nothing"}
          </span>
          <span className="font-display text-2xl font-bold">
            {amountToCollect > 0 ? formatPKR(amountToCollect) : formatPKR(0)}
          </span>
        </div>

        {/* ship to */}
        <div className="grid gap-6 py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-900/40">
              Ship to
            </p>
            <p className="mt-1 font-medium">{order.customerName}</p>
            <p className="text-sm text-purple-900/70">{order.address}</p>
            {order.city && <p className="text-sm text-purple-900/70">{order.city}</p>}
            <p className="mt-1 text-sm text-purple-900/70">{order.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-900/40">
              Payment
            </p>
            <p className="mt-1 text-sm">{payment}</p>
            <p className="text-sm text-purple-900/70">
              {order.paymentStatus === "paid" ? "Paid" : "Collect on delivery"}
            </p>
            {order.courier && (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-purple-900/40">
                  Courier
                </p>
                <p className="text-sm">
                  {order.courier} {order.trackingNumber && `· ${order.trackingNumber}`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* items */}
        <table className="w-full border-t border-purple-100 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-purple-900/40">
              <th className="w-8 py-2 font-medium">
                <span className="sr-only">Picked</span>
              </th>
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-t border-purple-50">
                {/* Ticked by hand while packing, so it must survive printing. */}
                <td className="py-2.5">
                  <span className="block h-3.5 w-3.5 rounded-sm border border-purple-900/40" />
                </td>
                <td className="py-2.5">
                  {it.title}
                  {it.variantTitle && (
                    <span className="text-purple-900/50"> · {it.variantTitle}</span>
                  )}
                </td>
                <td className="py-2.5 text-center font-medium">{it.quantity}</td>
                <td className="py-2.5 text-right text-purple-900/70">{formatPKR(it.price)}</td>
                <td className="py-2.5 text-right font-medium">{formatPKR(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* totals */}
        <div className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-purple-900/70">
            <span>Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-purple-900/70">
              <span>Discount</span>
              <span>− {formatPKR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-purple-900/70">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatPKR(order.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-purple-100 pt-1.5 font-display text-base font-semibold">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>

        {order.note && (
          <div className="mt-5 rounded-lg bg-cream/60 p-3 text-sm text-purple-900/70 print:bg-transparent">
            <strong className="text-purple-900">Note:</strong> {order.note}
          </div>
        )}

        <p className="mt-6 border-t border-purple-100 pt-4 text-center text-xs text-purple-900/40">
          Thank you for shopping with {settings.storeName}. 🌿
        </p>
      </div>
    </div>
  );
}
