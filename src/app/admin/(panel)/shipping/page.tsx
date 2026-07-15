import Link from "next/link";
import { Truck, Check, MapPin, Package, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR, formatWeight } from "@/lib/utils";
import { getSettings, settingNumber } from "@/lib/settings";
import { shippingProviders, zoomCodPublicConfig } from "@/lib/shipping";
import {
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
} from "./actions";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

const inputCls =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

export default async function ShippingPage() {
  const [settings, rates, shipments, shippedCount] = await Promise.all([
    getSettings(),
    prisma.shippingRate.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.order.findMany({
      where: { courier: { not: "" } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.order.count({ where: { courier: { not: "" } } }),
  ]);

  const threshold = settingNumber(settings, "freeShippingThreshold", 7000);
  const flat = settingNumber(settings, "flatShippingRate", 250);
  const zoom = zoomCodPublicConfig();
  const zoomLive = zoom.live;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 font-display text-2xl font-semibold text-purple-900">
        Shipping &amp; Delivery
      </h1>

      {/* Couriers */}
      <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
          <Truck className="h-5 w-5 text-green-600" /> Courier integrations
        </h2>
        <div className="space-y-3">
          {shippingProviders.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-purple-100 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-purple-900">{p.name}</p>
                <p className="text-xs text-purple-900/50">
                  Nationwide COD courier · book from any order
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  zoomLive ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                <Check className="h-3 w-3" /> {zoomLive ? "Live" : "Test mode"}
              </span>
            </div>
          ))}
        </div>
        {zoomLive ? (
          <div className="mt-3 rounded-lg bg-cream/60 px-4 py-3 text-xs text-purple-900/70">
            <p className="mb-1.5 font-semibold text-purple-900">Live booking config</p>
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              <span>Client code: <strong>{zoom.clientCode}</strong></span>
              <span>Profile (shipper): <strong>{zoom.profileId}</strong></span>
              <span>Origin city: <strong>{zoom.origin}</strong></span>
              <span>Product / service: <strong>Weight-based (auto)</strong></span>
            </div>
            <p className="mt-2 text-[0.7rem] text-purple-900/45">
              Real shipments are created on ZoomCOD when you click &ldquo;Book with ZoomCOD&rdquo;
              on an order. Destination uses the customer&apos;s city (must match a ZoomCOD city).
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-purple-900/50">
            Set <code className="rounded bg-cream px-1">ZOOMCOD_API_KEY</code> in your
            environment (and on Vercel) to enable live bookings. Until then, bookings generate
            a test tracking number.
          </p>
        )}
      </div>

      {/* Weight-based rate bands */}
      <div className="mt-6 rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Package className="h-4 w-4 text-green-600" />
          <h2 className="font-display text-base font-semibold text-purple-900">
            Weight-based shipping rates
          </h2>
        </div>
        <p className="mb-5 text-xs text-purple-900/50">
          Delivery is charged by total order weight. The first band whose range
          contains the cart weight is used. Leave the &ldquo;Max&rdquo; field
          empty for the heaviest, open-ended band. Orders at or above{" "}
          <strong>{formatPKR(threshold)}</strong> ship free regardless of weight
          (change the free-shipping threshold and the {formatPKR(flat)} fallback
          in{" "}
          <Link href="/admin/settings" className="font-medium text-green-700 hover:underline">
            Settings
          </Link>
          ).
        </p>

        {/* header row */}
        <div className="hidden grid-cols-[1fr_96px_96px_96px_56px_104px] gap-3 px-1 pb-2 text-[0.7rem] font-medium uppercase tracking-wide text-purple-900/40 sm:grid">
          <span>Label</span>
          <span>Min (g)</span>
          <span>Max (g)</span>
          <span>Rate (PKR)</span>
          <span>Active</span>
          <span></span>
        </div>

        <div className="space-y-2">
          {rates.map((r) => (
            <form
              key={r.id}
              action={updateShippingRate}
              className="grid grid-cols-2 items-center gap-3 rounded-lg border border-purple-100 p-3 sm:grid-cols-[1fr_96px_96px_96px_56px_104px] sm:border-0 sm:p-1"
            >
              <input type="hidden" name="id" value={r.id} />
              <input
                name="label"
                defaultValue={r.label}
                className={inputCls + " col-span-2 sm:col-span-1"}
              />
              <input
                name="minGrams"
                type="number"
                min={0}
                defaultValue={r.minGrams}
                className={inputCls}
              />
              <input
                name="maxGrams"
                type="number"
                min={0}
                defaultValue={r.maxGrams ?? ""}
                placeholder="∞"
                className={inputCls}
              />
              <input
                name="rate"
                type="number"
                min={0}
                defaultValue={r.rate}
                className={inputCls}
              />
              <label className="flex items-center justify-center">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={r.active}
                  className="h-4 w-4 rounded accent-green-600"
                />
              </label>
              <div className="col-span-2 flex items-center justify-end gap-1 sm:col-span-1">
                <button
                  type="submit"
                  className="rounded-md bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                  title="Save this rate"
                >
                  Save
                </button>
                <button
                  type="submit"
                  formAction={deleteShippingRate}
                  className="grid h-8 w-8 place-items-center rounded-md text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                  title="Delete this rate"
                  aria-label="Delete rate"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </form>
          ))}
          {rates.length === 0 && (
            <p className="rounded-lg bg-cream/60 px-4 py-6 text-center text-sm text-purple-900/50">
              No weight bands yet. Add one below, or a flat {formatPKR(flat)} fallback is used.
            </p>
          )}
        </div>

        {/* add new */}
        <form
          action={createShippingRate}
          className="mt-4 grid grid-cols-2 items-center gap-3 rounded-lg border border-dashed border-green-300 bg-green-50/40 p-3 sm:grid-cols-[1fr_96px_96px_96px_56px_104px]"
        >
          <input
            name="label"
            placeholder="e.g. 1kg to 3kg"
            className={inputCls + " col-span-2 sm:col-span-1"}
          />
          <input name="minGrams" type="number" min={0} placeholder="Min g" className={inputCls} />
          <input name="maxGrams" type="number" min={0} placeholder="Max g" className={inputCls} />
          <input name="rate" type="number" min={0} placeholder="PKR" className={inputCls} />
          <span className="hidden sm:block" />
          <button
            type="submit"
            className="col-span-2 inline-flex items-center justify-center gap-1 rounded-md gradient-purple-green px-3 py-2 text-xs font-semibold text-cream sm:col-span-1"
            title="Add rate band"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </form>

        {/* live preview of bands */}
        {rates.filter((r) => r.active).length > 0 && (
          <div className="mt-5 border-t border-purple-100 pt-4">
            <p className="mb-2 text-xs font-medium text-purple-900/60">Customer sees:</p>
            <div className="flex flex-wrap gap-2">
              {rates
                .filter((r) => r.active)
                .map((r) => (
                  <span
                    key={r.id}
                    className="rounded-full bg-cream px-3 py-1 text-xs text-purple-900/70"
                  >
                    {r.maxGrams == null
                      ? `Over ${formatWeight(r.minGrams)}`
                      : `${formatWeight(r.minGrams)} - ${formatWeight(r.maxGrams)}`}
                    {" · "}
                    <strong className="text-purple-900">{formatPKR(r.rate)}</strong>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Delivery zone */}
      <div className="mt-6 rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-purple-900">
          <MapPin className="h-4 w-4 text-green-600" /> Delivery zone
        </h2>
        <div className="flex items-center justify-between rounded-lg bg-cream/60 px-4 py-3 text-sm">
          <span className="font-medium text-purple-900">🇵🇰 Pakistan (Nationwide)</span>
          <span className="text-purple-900/60">2-5 business days</span>
        </div>
        <p className="mt-3 text-xs text-purple-900/50">
          COD available across all serviceable areas via ZoomCOD.
        </p>
      </div>

      {/* Recent shipments */}
      <div className="mt-6 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-purple-900">
            Recent shipments
          </h2>
          <span className="text-sm text-purple-900/50">{shippedCount} total</span>
        </div>
        {shipments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-purple-900/50">
            No shipments booked yet. Open an order and click &ldquo;Book with ZoomCOD&rdquo;.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Courier</th>
                <th className="px-5 py-3 font-medium">Tracking</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((o) => (
                <tr key={o.id} className="border-b border-purple-50 last:border-0 hover:bg-cream/40">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-semibold text-purple-900 hover:text-purple-700"
                    >
                      #{o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-purple-900/80">{o.customerName}</td>
                  <td className="px-5 py-3 text-purple-900/70">{o.courier}</td>
                  <td className="px-5 py-3 font-mono text-xs text-purple-700">
                    {o.trackingNumber || " - "}
                  </td>
                  <td className="px-5 py-3 text-purple-900/60">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
