import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { getPaymentMethod } from "@/lib/payments";
import { PurchaseTracker } from "@/components/store/PurchaseTracker";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const orderNumber = Number(number);
  if (!Number.isFinite(orderNumber)) notFound();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  const payment = getPaymentMethod(order.paymentMethod);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-20 pt-32 text-center lg:px-8">
      <PurchaseTracker
        orderNumber={order.orderNumber}
        total={order.total}
        items={order.items.map((it) => ({
          id: it.productId ?? it.id,
          name: it.title,
          price: it.price,
          quantity: it.quantity,
          variant: it.variantTitle || undefined,
        }))}
      />
      <div className="grid place-items-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-green-100">
          <CheckCircle2 className="h-11 w-11 text-green-600" />
        </div>
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold text-purple-900">
        Thank you{order.customerName ? `, ${order.customerName.split(" ")[0]}` : ""}! 🎉
      </h1>
      <p className="mt-2 text-purple-900/60">
        Your order <strong className="text-purple-900">#{order.orderNumber}</strong> has been
        placed successfully. We&apos;ll be in touch shortly.
      </p>

      {/* card */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-purple-100 bg-white text-left shadow-sm">
        <div className="space-y-3 border-b border-purple-100 p-6">
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
        <div className="space-y-2 p-6 text-sm">
          <Row label="Subtotal" value={formatPKR(order.subtotal)} />
          {order.discount > 0 && (
            <Row
              label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
              value={`− ${formatPKR(order.discount)}`}
            />
          )}
          <Row
            label="Shipping"
            value={order.shipping === 0 ? "Free" : formatPKR(order.shipping)}
          />
          <div className="flex justify-between border-t border-purple-100 pt-2 font-display text-lg font-semibold text-purple-900">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* meta */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Meta icon={Package} label="Payment" value={payment?.label ?? order.paymentMethod} />
        <Meta icon={Truck} label="Delivery to" value={order.city || " - "} />
        <Meta
          icon={CheckCircle2}
          label="Status"
          value={order.paymentStatus === "paid" ? "Paid" : "Pending"}
        />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="rounded-full gradient-purple-green px-7 py-3.5 text-sm font-semibold text-cream"
        >
          Continue shopping
        </Link>
        <Link
          href={`/track?order=${order.orderNumber}&contact=${encodeURIComponent(order.email || order.phone)}`}
          className="rounded-full border border-purple-200 px-7 py-3.5 text-sm font-semibold text-purple-900 hover:bg-purple-50"
        >
          Track this order
        </Link>
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

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-4">
      <Icon className="mx-auto h-5 w-5 text-green-600" />
      <p className="mt-2 text-xs uppercase tracking-wide text-purple-900/40">{label}</p>
      <p className="text-sm font-medium text-purple-900">{value}</p>
    </div>
  );
}
