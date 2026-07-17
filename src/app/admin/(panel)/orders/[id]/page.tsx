import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  Inbox,
  Package,
  CreditCard,
  ShieldQuestion,
  Truck,
  MessageCircle,
  Printer,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { getPaymentMethod } from "@/lib/payments";
import { getOrderTimeline } from "@/lib/order-events";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderTimeline } from "@/components/admin/OrderTimeline";
import { OrderActionsMenu } from "@/components/admin/OrderActionsMenu";
import { OrderNotesCard } from "@/components/admin/OrderNotesCard";
import { OrderTagsCard } from "@/components/admin/OrderTagsCard";
import {
  markPaid,
  markFulfilled,
  markDelivered,
  toggleArchive,
  bookZoomCOD,
  refreshZoomCodStatus,
  resendConfirmation,
  placeDraftOrder,
  notifyShipped,
  refundOrder,
  cancelOrder,
  requestReview,
  updateOrderNote,
  addOrderTag,
  removeOrderTag,
  addOrderComment,
} from "../actions";

function fullDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { imageUrl: true, emoji: true, slug: true } } } },
    },
  });
  if (!order) notFound();

  const [timeline, settings, prev, next, customerOrderCount] = await Promise.all([
    getOrderTimeline(order),
    getSettings(),
    // Shopify's up/down arrows step through orders by number, not by id.
    prisma.order.findFirst({
      where: { orderNumber: { gt: order.orderNumber }, isDraft: false },
      orderBy: { orderNumber: "asc" },
      select: { id: true },
    }),
    prisma.order.findFirst({
      where: { orderNumber: { lt: order.orderNumber }, isDraft: false },
      orderBy: { orderNumber: "desc" },
      select: { id: true },
    }),
    order.customerId
      ? prisma.order.count({ where: { customerId: order.customerId, isDraft: false } })
      : order.email
        ? prisma.order.count({ where: { email: order.email, isDraft: false } })
        : 1,
  ]);

  const isCancelled = order.fulfillmentStatus === "cancelled";
  const isRefunded = order.paymentStatus === "refunded";
  const isPaid = order.paymentStatus === "paid";
  const isFulfilled = order.fulfillmentStatus === "fulfilled";
  const unitCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const paymentLabel = getPaymentMethod(order.paymentMethod)?.label ?? order.paymentMethod;
  const tags = order.tags.split(",").map((t) => t.trim()).filter(Boolean);

  // Bind the order id once; each of these is a server action the forms post to.
  const bind = <T,>(fn: (orderId: string, fd: FormData) => Promise<T>) => fn.bind(null, order.id);
  const markPaidAction = markPaid.bind(null, order.id);
  const markFulfilledAction = markFulfilled.bind(null, order.id);
  const markDeliveredAction = markDelivered.bind(null, order.id);
  const bookAction = bookZoomCOD.bind(null, order.id);
  const refreshStatusAction = refreshZoomCodStatus.bind(null, order.id);
  const placeDraftAction = placeDraftOrder.bind(null, order.id);
  const notifyShippedAction = notifyShipped.bind(null, order.id);
  const refundAction = refundOrder.bind(null, order.id);

  const menuActions = [
    { label: "Resend confirmation email", action: resendConfirmation.bind(null, order.id) },
    ...(isFulfilled && order.email
      ? [{ label: "Request a review", action: requestReview.bind(null, order.id) }]
      : []),
    ...(order.courier
      ? [{ label: "Email tracking to customer", action: notifyShippedAction }]
      : []),
    { label: order.archivedAt ? "Unarchive" : "Archive", action: toggleArchive.bind(null, order.id) },
    ...(!isCancelled
      ? [{ label: "Cancel and restock", action: cancelOrder.bind(null, order.id), danger: true }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {order.isDraft && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-medium text-amber-900">
            This is a <strong>draft order</strong> and has not been placed yet.
          </p>
          <form action={placeDraftAction}>
            <button className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream">
              Mark as placed
            </button>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/orders"
              aria-label="Back to orders"
              className="grid h-7 w-7 place-items-center rounded text-purple-900/45 hover:bg-purple-50 hover:text-purple-900"
            >
              <Inbox className="h-4 w-4" />
            </Link>
            <h1 className="font-display text-2xl font-semibold text-purple-900">
              #{order.orderNumber}
            </h1>
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.fulfillmentStatus} />
            {order.archivedAt && <StatusBadge status="archived" />}
          </div>
          <p className="mt-1 pl-9 text-sm text-purple-900/55">
            {fullDateTime(order.createdAt)} from {order.isDraft ? "Draft" : "Online Store"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPaid && !isRefunded && (
            <form action={refundAction}>
              <button className="rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50">
                Refund
              </button>
            </form>
          )}
          <Link
            href={`/admin/orders/${order.id}/packing-slip`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
          >
            <Printer className="h-4 w-4" /> Packing slip
          </Link>
          <OrderActionsMenu actions={menuActions} />
          <div className="flex">
            <Link
              href={prev ? `/admin/orders/${prev.id}` : "#"}
              aria-disabled={!prev}
              aria-label="Newer order"
              className={`grid h-9 w-9 place-items-center rounded-l-lg border border-purple-200 bg-white text-purple-900/70 ${
                prev ? "hover:bg-purple-50" : "pointer-events-none opacity-40"
              }`}
            >
              <ChevronUp className="h-4 w-4" />
            </Link>
            <Link
              href={next ? `/admin/orders/${next.id}` : "#"}
              aria-disabled={!next}
              aria-label="Older order"
              className={`-ml-px grid h-9 w-9 place-items-center rounded-r-lg border border-purple-200 bg-white text-purple-900/70 ${
                next ? "hover:bg-purple-50" : "pointer-events-none opacity-40"
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-5">
          {/* Fulfilment */}
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800">
                <Package className="h-3.5 w-3.5" />
                {isFulfilled ? `Fulfilled (${unitCount})` : `Unfulfilled (${unitCount})`}
              </span>
              {isFulfilled && (
                <span className="font-mono text-sm text-purple-900/50">
                  #{order.orderNumber}-F1
                </span>
              )}
            </div>

            {order.courier && (
              <div className="mb-4 rounded-xl border border-purple-100 bg-cream/40 px-4 py-3 text-sm">
                <p className="flex items-center gap-2 text-purple-900/80">
                  <Truck className="h-4 w-4 text-purple-900/40" />
                  {order.courier} tracking:{" "}
                  {order.trackingNumber ? (
                    <a
                      href={`https://portal.zoomcod.com/track-details.php?track_code=${order.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 underline hover:text-blue-800"
                    >
                      {order.trackingNumber}
                    </a>
                  ) : (
                    <span className="text-purple-900/50">not assigned</span>
                  )}
                </p>
                {order.courierStatus && (
                  <p className="mt-1.5 text-xs text-purple-900/55">
                    Latest status: {order.courierStatus}
                  </p>
                )}
              </div>
            )}

            <ul className="divide-y divide-purple-50">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-3">
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-purple-100 bg-cream text-lg">
                    {it.product?.imageUrl ? (
                      <Image
                        src={it.product.imageUrl}
                        alt={it.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      (it.product?.emoji ?? "🌿")
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    {it.product?.slug ? (
                      <Link
                        href={`/product/${it.product.slug}`}
                        className="block truncate text-sm font-medium text-purple-900 hover:text-purple-700"
                      >
                        {it.title}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium text-purple-900">
                        {it.title}
                      </span>
                    )}
                    {it.variantTitle && (
                      <span className="mt-0.5 inline-block rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">
                        {it.variantTitle}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm text-purple-900/60">
                    {formatPKR(it.price)} × {it.quantity}
                  </span>
                  <span className="w-24 shrink-0 text-right text-sm font-medium text-purple-900">
                    {formatPKR(it.total)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {!order.courier && !isCancelled && (
                <form action={bookAction}>
                  <button className="rounded-lg border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-semibold text-green-800 hover:bg-green-100">
                    Book with ZoomCOD
                  </button>
                </form>
              )}
              {order.courier && (
                <form action={refreshStatusAction}>
                  <button className="rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50">
                    Refresh status
                  </button>
                </form>
              )}
              {order.shipmentLabelUrl && (
                <a
                  href={order.shipmentLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
                >
                  Print label
                </a>
              )}
              {!isFulfilled && !isCancelled && (
                <form action={markFulfilledAction}>
                  <button className="rounded-lg gradient-purple-green px-3.5 py-2 text-sm font-semibold text-cream">
                    Mark as fulfilled
                  </button>
                </form>
              )}
              {isFulfilled && !order.deliveredAt && !isCancelled && (
                <form action={markDeliveredAction}>
                  <button className="rounded-lg bg-purple-900 px-3.5 py-2 text-sm font-semibold text-cream hover:bg-purple-800">
                    Mark as delivered
                  </button>
                </form>
              )}
              {order.deliveredAt && (
                <span className="self-center text-sm font-medium text-green-700">
                  Delivered {fullDateTime(order.deliveredAt)}
                </span>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800">
              <CreditCard className="h-3.5 w-3.5" />
              {isRefunded ? "Refunded" : isPaid ? "Paid" : "Payment pending"}
            </span>

            <dl className="space-y-2 text-sm">
              <Row
                label="Subtotal"
                hint={`${unitCount} item${unitCount === 1 ? "" : "s"}`}
                value={formatPKR(order.subtotal)}
              />
              {order.discount > 0 && (
                <Row
                  label="Discount"
                  hint={order.discountCode || undefined}
                  value={`− ${formatPKR(order.discount)}`}
                />
              )}
              <Row
                label="Shipping"
                hint={order.shippingMethod || undefined}
                value={order.shipping === 0 ? "Free" : formatPKR(order.shipping)}
              />
              <div className="flex justify-between border-t border-purple-100 pt-2 font-semibold text-purple-900">
                <dt>Total</dt>
                <dd>{formatPKR(order.total)}</dd>
              </div>
              <div className="flex justify-between border-t border-purple-100 pt-2 text-purple-900/70">
                <dt>
                  {isRefunded ? "Refunded" : isPaid ? "Paid" : `To collect via ${paymentLabel}`}
                </dt>
                <dd className="font-medium text-purple-900">
                  {isRefunded ? `− ${formatPKR(order.total)}` : formatPKR(order.total)}
                </dd>
              </div>
            </dl>

            {!isPaid && !isRefunded && !isCancelled && (
              <div className="mt-4 flex justify-end">
                <form action={markPaidAction}>
                  <button className="rounded-lg bg-purple-900 px-3.5 py-2 text-sm font-semibold text-cream hover:bg-purple-800">
                    Collect payment
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-display text-base font-semibold text-purple-900">
              Timeline
            </h2>

            <form action={bind(addOrderComment)} className="mb-5">
              <textarea
                name="body"
                rows={2}
                placeholder="Leave a comment..."
                className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-purple-900/45">
                  Only you and other staff can see comments
                </p>
                <button className="rounded-lg gradient-purple-green px-3.5 py-1.5 text-sm font-semibold text-cream">
                  Post
                </button>
              </div>
            </form>

            <OrderTimeline entries={timeline} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <OrderNotesCard note={order.note} save={bind(updateOrderNote)} />

          {/* Customer */}
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-purple-900">
              Customer
            </h2>
            {order.customerId ? (
              <Link
                href={`/admin/customers/${order.customerId}`}
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                {order.customerName}
              </Link>
            ) : (
              <p className="text-sm font-medium text-purple-900">{order.customerName}</p>
            )}
            <p className="mt-0.5 text-sm text-purple-900/55">
              {customerOrderCount} order{customerOrderCount === 1 ? "" : "s"}
            </p>

            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-purple-900/40">
              Contact information
            </h3>
            {order.email ? (
              <a
                href={`mailto:${order.email}`}
                className="mt-1 block break-all text-sm text-green-700 hover:text-green-800"
              >
                {order.email}
              </a>
            ) : (
              <p className="mt-1 text-sm text-purple-900/45">No email provided</p>
            )}
            {order.phone && (
              <a
                href={`tel:${order.phone}`}
                className="mt-0.5 block text-sm text-green-700 hover:text-green-800"
              >
                {order.phone}
              </a>
            )}

            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-purple-900/40">
              Shipping address
            </h3>
            <address className="mt-1 whitespace-pre-line text-sm not-italic text-purple-900/70">
              {[order.customerName, order.address, order.city, "Pakistan", order.phone]
                .filter(Boolean)
                .join("\n")}
            </address>
            {order.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${order.address} ${order.city} Pakistan`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-green-700 hover:text-green-800"
              >
                View map
              </a>
            )}

            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-purple-900/40">
              Billing address
            </h3>
            <p className="mt-1 text-sm text-purple-900/70">Same as shipping address</p>
          </div>

          {/* WhatsApp */}
          {order.phone && (
            <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
              <h2 className="mb-1 flex items-center gap-2 font-display text-base font-semibold text-purple-900">
                <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp customer
              </h2>
              <p className="mb-3 text-xs text-purple-900/50">
                Opens WhatsApp with a ready-to-send message.
              </p>
              <div className="space-y-2">
                {(
                  [
                    { kind: "confirmed", label: "Order confirmed" },
                    { kind: "shipped", label: "Out for delivery" },
                    { kind: "delivered", label: "Delivered + review" },
                  ] as const
                ).map((t) => (
                  <a
                    key={t.kind}
                    href={waOrderLink(order, t.kind, settings.storeName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
                  >
                    {t.label}
                    <MessageCircle className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Conversion summary — only the part we can actually stand behind. */}
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-semibold text-purple-900">
              Conversion summary
            </h2>
            <p className="flex items-start gap-2 text-sm text-purple-900/70">
              <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-900/40" />
              {customerOrderCount === 1
                ? "This is their first order"
                : `This is their ${ordinal(customerOrderCount)} order`}
            </p>
            <p className="mt-2 text-xs text-purple-900/45">
              Session and referral data isn&apos;t tracked per order yet.
            </p>
          </div>

          {/* Order risk */}
          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <h2 className="mb-2 flex items-center justify-between font-display text-base font-semibold text-purple-900">
              Order risk
              <ShieldQuestion className="h-4 w-4 text-purple-900/35" />
            </h2>
            <p className="text-sm text-purple-900/55">Analysis not available</p>
          </div>

          <OrderTagsCard tags={tags} add={bind(addOrderTag)} remove={bind(removeOrderTag)} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-purple-900/70">
      <dt className="flex-1">
        {label}
        {hint && <span className="ml-2 text-purple-900/45">{hint}</span>}
      </dt>
      <dd className="shrink-0 text-purple-900">{value}</dd>
    </div>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/** Pakistan phone → wa.me digits (international, no + or leading 0). */
function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  else if (!d.startsWith("92") && d.length <= 10) d = "92" + d;
  return d;
}

/** Build a wa.me link with a prefilled order-update message for the customer. */
function waOrderLink(
  order: {
    phone: string;
    customerName: string;
    orderNumber: number;
    courier: string;
    trackingNumber: string;
  },
  kind: "confirmed" | "shipped" | "delivered",
  storeName: string,
) {
  const first = order.customerName.split(" ")[0] || "there";
  const n = order.orderNumber;
  let msg = "";
  if (kind === "confirmed") {
    msg = `Assalam o Alaikum ${first}, thank you for your order #${n} with ${storeName}! 🌿 We've received it and will dispatch it shortly. We'll share tracking once it ships.`;
  } else if (kind === "shipped") {
    const track = order.trackingNumber
      ? ` It's on the way via ${order.courier || "our courier"}, tracking ${order.trackingNumber}.`
      : " It's on the way and should arrive in 2-5 working days.";
    msg = `Good news ${first}! Your ${storeName} order #${n} has been dispatched. 🚚${track}`;
  } else {
    msg = `Hi ${first}, we hope your order #${n} arrived safely and you're enjoying it! 🌿 If you have a moment, a quick review would mean a lot. Thank you for shopping with ${storeName}.`;
  }
  return `https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(msg)}`;
}
