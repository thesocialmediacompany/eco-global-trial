import type { Metadata } from "next";
import Link from "next/link";
import { Search, CheckCircle2, Package, Truck, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Eco Global Foods order.",
};

function normalisePhone(s: string) {
  return s.replace(/\D/g, "").replace(/^0+/, "");
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; contact?: string }>;
}) {
  const sp = await searchParams;
  const orderInput = (sp.order ?? "").trim();
  const contactInput = (sp.contact ?? "").trim();
  const searched = Boolean(orderInput && contactInput);

  let order = null;
  let notMatched = false;

  if (searched) {
    const orderNumber = Number(orderInput.replace(/[^0-9]/g, ""));
    const found = Number.isFinite(orderNumber)
      ? await prisma.order.findUnique({
          where: { orderNumber },
          include: { items: true },
        })
      : null;

    // Verify the contact matches the order (email or phone) so a bare order
    // number can't expose a stranger's details.
    if (found && !found.isDraft) {
      const c = contactInput.toLowerCase();
      const emailMatch = found.email && found.email.toLowerCase() === c;
      const phoneMatch =
        found.phone && normalisePhone(found.phone) === normalisePhone(contactInput);
      if (emailMatch || phoneMatch) order = found;
      else notMatched = true;
    } else {
      notMatched = true;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20 pt-32 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-purple-900">
          Track your order
        </h1>
        <p className="mt-2 text-purple-900/60">
          Enter your order number and the email or phone you used at checkout.
        </p>
      </div>

      {/* lookup form (GET → same page) */}
      <form
        method="get"
        className="mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:flex-row"
      >
        <input
          name="order"
          defaultValue={orderInput}
          required
          placeholder="Order number (e.g. 1042)"
          className="flex-1 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
        />
        <input
          name="contact"
          defaultValue={contactInput}
          required
          placeholder="Email or phone"
          className="flex-1 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-xl gradient-purple-green px-5 py-2.5 text-sm font-semibold text-cream">
          <Search className="h-4 w-4" /> Track
        </button>
      </form>

      {searched && notMatched && (
        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900">
          We couldn&apos;t find an order matching those details. Double-check the
          order number and the email or phone you used at checkout.
        </div>
      )}

      {order && (
        <div className="mt-8">
          <Timeline
            paymentStatus={order.paymentStatus}
            fulfillmentStatus={order.fulfillmentStatus}
            hasTracking={Boolean(order.trackingNumber)}
          />

          <div className="mt-6 overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-purple-100 px-6 py-4">
              <div>
                <p className="font-display text-lg font-semibold text-purple-900">
                  Order #{order.orderNumber}
                </p>
                <p className="text-sm text-purple-900/50">
                  {order.fulfillmentStatus === "cancelled"
                    ? "Cancelled"
                    : order.fulfillmentStatus === "fulfilled"
                      ? "Shipped"
                      : "Being prepared"}
                </p>
              </div>
              {order.trackingNumber && (
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-purple-900/40">
                    {order.courier || "Tracking"}
                  </p>
                  <p className="font-mono text-sm text-purple-700">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 border-b border-purple-100 p-6">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <span className="text-purple-900">
                    {it.title}
                    {it.variantTitle && (
                      <span className="text-purple-900/50"> · {it.variantTitle}</span>
                    )}
                    <span className="text-purple-900/50"> × {it.quantity}</span>
                  </span>
                  <span className="font-medium text-purple-900">{formatPKR(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between p-6 font-display text-lg font-semibold text-purple-900">
              <span>Total</span>
              <span>{formatPKR(order.total)}</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-purple-900/50">
            Questions about your order?{" "}
            <Link href="/contact" className="font-medium text-green-700 hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function Timeline({
  paymentStatus,
  fulfillmentStatus,
  hasTracking,
}: {
  paymentStatus: string;
  fulfillmentStatus: string;
  hasTracking: boolean;
}) {
  if (fulfillmentStatus === "cancelled") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
        <XCircle className="h-5 w-5" /> This order was cancelled.
        {paymentStatus === "refunded" && " A refund has been issued."}
      </div>
    );
  }

  const shipped = fulfillmentStatus === "fulfilled" || hasTracking;
  const steps = [
    { label: "Confirmed", icon: CheckCircle2, done: true },
    { label: "Preparing", icon: Package, done: true },
    { label: "Shipped", icon: Truck, done: shipped },
    { label: "Delivered", icon: CheckCircle2, done: false },
  ];

  return (
    <div className="flex items-center justify-between rounded-2xl border border-purple-100 bg-white px-6 py-5 shadow-sm">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`grid h-10 w-10 place-items-center rounded-full ${
                s.done ? "gradient-purple-green text-cream" : "bg-purple-50 text-purple-900/30"
              }`}
            >
              {s.done ? <s.icon className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <span
              className={`text-xs ${s.done ? "font-medium text-purple-900" : "text-purple-900/40"}`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-1 h-0.5 flex-1 rounded ${
                steps[i + 1].done ? "bg-green-400" : "bg-purple-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
