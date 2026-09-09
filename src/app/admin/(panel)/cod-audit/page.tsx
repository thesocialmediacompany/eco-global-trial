import Link from "next/link";
import { ShieldAlert, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { formatPKR } from "@/lib/utils";
import { formatDateTime } from "@/lib/dates";

// Reads live order data on every visit — this is a safety check, never cache it.
export const dynamic = "force-dynamic";

/**
 * COD audit — prepaid orders that were handed to the courier with cash still to
 * collect, so the customer risks being charged a SECOND time on delivery.
 *
 * Two buckets:
 *   • codBooked > 0  → definitely wrong: a paid order booked to collect cash.
 *   • codBooked null → booked before we recorded the collection amount, so it
 *     predates the fix and can't be assumed safe — verify it in the portal.
 * Correctly-booked prepaid orders (codBooked === 0) never appear here.
 */
export default async function CodAuditPage() {
  await requireOwner();

  const orders = await prisma.order.findMany({
    where: {
      isDraft: false,
      paymentStatus: "paid",
      trackingNumber: { notIn: ["", "BOOKING"] },
      OR: [{ codBooked: null }, { codBooked: { gt: 0 } }],
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      city: true,
      total: true,
      paymentMethod: true,
      trackingNumber: true,
      courier: true,
      courierStatus: true,
      codBooked: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const definite = orders.filter((o) => (o.codBooked ?? 0) > 0);
  const atRisk = orders.filter((o) => o.codBooked == null);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-purple-700" />
        <h1 className="text-2xl font-semibold tracking-tight text-purple-900">COD audit</h1>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-purple-900/60">
        Prepaid orders booked with the courier while cash is still set to be collected on
        delivery — these customers risk being charged twice. Fix each in the ZoomCOD portal
        (set the collection amount to <strong>Rs 0</strong>, or cancel and re-book after the
        latest deploy). New bookings are handled automatically, so this list only shrinks.
      </p>

      {/* summary chips */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Double-charge — fix now
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-rose-800">
            {definite.length}
          </div>
          <p className="mt-1 text-xs text-rose-700/80">
            Paid orders booked to collect cash. {formatPKR(definite.reduce((s, o) => s + (o.codBooked ?? 0), 0))} at stake.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Booked before fix — verify
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-amber-800">
            {atRisk.length}
          </div>
          <p className="mt-1 text-xs text-amber-700/80">
            Paid &amp; booked earlier, collection amount unknown. Check the portal to be safe.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            No orders at risk. Every prepaid, booked order was set to collect Rs 0.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-purple-100 bg-white shadow-soft-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-purple-100 bg-cream/40 text-xs uppercase tracking-wide text-purple-900/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Paid via</th>
                <th className="px-4 py-3 text-right font-semibold">Order total</th>
                <th className="px-4 py-3 text-right font-semibold">Set to collect</th>
                <th className="px-4 py-3 font-semibold">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {orders.map((o) => {
                const wrong = (o.codBooked ?? 0) > 0;
                return (
                  <tr key={o.id} className="hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-purple-700 hover:underline"
                      >
                        #{o.orderNumber}
                      </Link>
                      <div className="text-[0.7rem] text-purple-900/45">
                        {formatDateTime(o.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-purple-900">{o.customerName}</div>
                      <div className="text-[0.7rem] text-purple-900/45">{o.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-purple-900/80">{o.city}</td>
                    <td className="px-4 py-3 capitalize text-purple-900/80">{o.paymentMethod}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-purple-900/80">
                      {formatPKR(o.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {wrong ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                          <AlertTriangle className="h-3 w-3" />
                          {formatPKR(o.codBooked ?? 0)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Unknown
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://portal.zoomcod.com/track-details.php?track_code=${o.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        {o.trackingNumber}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
