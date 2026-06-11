import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Phone, Mail, Truck, Send, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  markPaid,
  markFulfilled,
  bookZoomCOD,
  resendConfirmation,
  placeDraftOrder,
  notifyShipped,
  refundOrder,
  cancelOrder,
  requestReview,
} from "../actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const markPaidAction = markPaid.bind(null, order.id);
  const markFulfilledAction = markFulfilled.bind(null, order.id);
  const bookAction = bookZoomCOD.bind(null, order.id);
  const resendAction = resendConfirmation.bind(null, order.id);
  const placeDraftAction = placeDraftOrder.bind(null, order.id);
  const notifyShippedAction = notifyShipped.bind(null, order.id);
  const refundAction = refundOrder.bind(null, order.id);
  const cancelAction = cancelOrder.bind(null, order.id);
  const requestReviewAction = requestReview.bind(null, order.id);
  const isCancelled = order.fulfillmentStatus === "cancelled";
  const isRefunded = order.paymentStatus === "refunded";

  return (
    <div className="mx-auto max-w-5xl">
      {order.isDraft && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-medium text-amber-900">
            📝 This is a <strong>draft order</strong> - not yet placed.
          </p>
          <form action={placeDraftAction}>
            <button className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
              Mark as placed
            </button>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-semibold text-purple-900">
              Order #{order.orderNumber}
            </h1>
            <div className="mt-1 flex gap-2">
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <form action={resendAction}>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50">
              <Send className="h-4 w-4" /> Resend email
            </button>
          </form>
          {order.paymentStatus !== "paid" && !isRefunded && (
            <form action={markPaidAction}>
              <button className="rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50">
                Mark as paid
              </button>
            </form>
          )}
          {order.fulfillmentStatus !== "fulfilled" && !isCancelled && (
            <form action={markFulfilledAction}>
              <button className="rounded-lg gradient-purple-green px-3.5 py-2 text-sm font-semibold text-cream hover:opacity-95">
                Mark as fulfilled
              </button>
            </form>
          )}
          {order.fulfillmentStatus === "fulfilled" && order.email && (
            <form action={requestReviewAction}>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50">
                <Star className="h-4 w-4" /> Request review
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Refund / cancel row */}
      {!order.isDraft && !(isCancelled && isRefunded) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-100 bg-white px-5 py-3.5 shadow-sm">
          <p className="text-sm text-purple-900/60">
            {isCancelled
              ? "This order is cancelled and its stock was returned."
              : isRefunded
                ? "This order has been refunded."
                : "Need to undo this order? Refund the payment or cancel and restock."}
          </p>
          <div className="flex gap-2">
            {order.paymentStatus === "paid" && !isRefunded && (
              <form action={refundAction}>
                <button className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                  Refund payment
                </button>
              </form>
            )}
            {!isCancelled && (
              <form action={cancelAction}>
                <button className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
                  Cancel &amp; restock
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Line items */}
          <div className="rounded-xl border border-purple-100 bg-white shadow-sm">
            <h2 className="border-b border-purple-100 px-5 py-4 font-display text-base font-semibold text-purple-900">
              Items
            </h2>
            <div className="divide-y divide-purple-50">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-medium text-purple-900">{it.title}</p>
                    {it.variantTitle && (
                      <p className="text-xs text-purple-900/50">{it.variantTitle}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-purple-900/80">
                    {formatPKR(it.price)} × {it.quantity}
                    <span className="ml-3 font-medium text-purple-900">
                      {formatPKR(it.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="space-y-1.5 border-t border-purple-100 px-5 py-4 text-sm">
              <Row label="Subtotal" value={formatPKR(order.subtotal)} />
              <Row
                label="Shipping"
                value={order.shipping === 0 ? "Free" : formatPKR(order.shipping)}
              />
              <div className="mt-2 flex justify-between border-t border-purple-100 pt-2 text-base font-semibold text-purple-900">
                <span>Total</span>
                <span>{formatPKR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping / ZoomCOD */}
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-purple-900">
              <Truck className="h-4 w-4 text-green-600" /> Shipping
            </h2>
            {order.courier ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-purple-900/80">
                  Booked with <strong>{order.courier}</strong>
                  {order.trackingNumber && (
                    <>
                      {" "}
                      · Tracking{" "}
                      <span className="font-mono text-purple-700">
                        {order.trackingNumber}
                      </span>
                    </>
                  )}
                </p>
                <form action={notifyShippedAction}>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50">
                    <Send className="h-4 w-4" /> Email tracking
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-purple-900/60">
                  Not yet booked with a courier.
                </p>
                <form action={bookAction}>
                  <button className="rounded-lg border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-semibold text-green-800 hover:bg-green-100">
                    Book with ZoomCOD
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-purple-900">
              Customer
            </h2>
            <p className="font-medium text-purple-900">{order.customerName}</p>
            <div className="mt-3 space-y-2 text-sm text-purple-900/70">
              {order.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-900/40" /> {order.email}
                </p>
              )}
              {order.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-900/40" /> {order.phone}
                </p>
              )}
              {order.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-900/40" />
                  <span>
                    {order.address}
                    {order.city && `, ${order.city}`}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-purple-900">
              Payment
            </h2>
            <p className="text-sm text-purple-900/80">
              <StatusBadge status={order.paymentMethod} />
            </p>
            <p className="mt-3 text-sm text-purple-900/60">
              Status: <StatusBadge status={order.paymentStatus} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-purple-900/70">
      <span>{label}</span>
      <span className="text-purple-900">{value}</span>
    </div>
  );
}
