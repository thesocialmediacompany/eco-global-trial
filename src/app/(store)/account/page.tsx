import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { CUSTOMER_COOKIE, verifyCustomer } from "@/lib/customer-auth";
import { PageBanner } from "@/components/store/PageBanner";
import { TrackOrder } from "@/components/store/TrackOrder";
import { AccountAuth } from "@/components/store/AccountAuth";
import { AccountNav } from "@/components/store/AccountNav";
import { ReorderButton } from "@/components/store/ReorderButton";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata: Metadata = {
  title: "My Account",
  description: "Sign in to track your Eco Global Foods orders.",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default async function AccountPage() {
  const store = await cookies();
  const session = await verifyCustomer(store.get(CUSTOMER_COOKIE)?.value);

  // ── Logged-in dashboard ──────────────────────────────────────────
  if (session) {
    const orders = await prisma.order.findMany({
      where: { OR: [{ customerId: session.sub }, { email: session.email }] },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { include: { variants: true } } } },
      },
    });

    // Pre-resolve each order's lines into cart-ready items for "Buy again".
    const reorderItems = (order: (typeof orders)[number]) =>
      order.items
        .filter((it) => it.product)
        .map((it) => {
          const p = it.product!;
          const variant = p.variants.find((v) => v.title === it.variantTitle);
          return {
            productId: p.id,
            slug: p.slug,
            title: p.title,
            variantTitle: it.variantTitle,
            price: variant?.price ?? p.price,
            emoji: p.emoji,
            gradient: p.gradient,
            imageUrl: p.imageUrl || undefined,
            weightGrams: variant?.weightGrams ?? p.variants[0]?.weightGrams ?? 0,
            quantity: it.quantity,
          };
        });

    return (
      <>
        <PageBanner
          emoji="👤"
          eyebrow="My Account"
          title={`Welcome back, ${session.name.split(" ")[0]}`}
          description="Your orders and goodness, all in one place."
        />
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <AccountNav />
            <h2 className="mb-6 font-display text-2xl font-semibold text-purple-900">
              Order history
            </h2>

            {orders.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-purple-200 bg-white/60 py-16 text-center">
                <Package className="h-10 w-10 text-purple-300" />
                <p className="mt-3 text-purple-900/60">No orders yet.</p>
                <Link
                  href="/shop"
                  className="mt-4 rounded-full gradient-purple-green px-6 py-2.5 text-sm font-semibold text-cream"
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                      <th className="px-5 py-3 font-medium">Order</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 text-right font-medium">Total</th>
                      <th className="px-5 py-3 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-purple-50 last:border-0">
                        <td className="px-5 py-3">
                          <Link
                            href={`/order/${o.orderNumber}`}
                            className="font-semibold text-purple-900 hover:text-purple-700"
                          >
                            #{o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-purple-900/70">
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={o.fulfillmentStatus} />
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-purple-900">
                          {formatPKR(o.total)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <ReorderButton items={reorderItems(o)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  // ── Signed-out: auth + order tracking ────────────────────────────
  return (
    <>
      <PageBanner
        emoji="👤"
        eyebrow="Account"
        title="Sign in to your account"
        description="Track your orders and check out faster."
      />
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <AccountAuth />
          <div className="mt-8 rounded-2xl border border-purple-100 bg-white p-6">
            <h2 className="font-display text-base font-semibold text-purple-900">
              Track an order without signing in
            </h2>
            <p className="mt-1 text-sm text-purple-900/60">Enter your order number.</p>
            <div className="mt-4">
              <TrackOrder />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
