"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Truck } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

export interface OrderRow {
  id: string;
  orderNumber: number;
  customerName: string;
  date: string;
  channel: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  itemCount: number;
  deliveryStatus: string;
  deliveryMethod: string;
}

export function OrdersTable({
  orders,
  bulkFulfill,
}: {
  orders: OrderRow[];
  bulkFulfill: (ids: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = orders.length > 0 && selected.size === orders.length;
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));

  function runBulk() {
    const ids = [...selected];
    startTransition(async () => {
      await bulkFulfill(ids);
      setSelected(new Set());
    });
  }

  if (orders.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-purple-900/50">
        No orders in this view.
      </div>
    );
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 bg-purple-50/60 px-4 py-2.5">
          <span className="text-sm font-medium text-purple-900">
            {selected.size} selected
          </span>
          <button
            onClick={runBulk}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-3.5 py-1.5 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Mark fulfilled
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full whitespace-nowrap text-sm">
          <thead>
            <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="h-4 w-4 rounded accent-purple-600"
                />
              </th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment status</th>
              <th className="px-4 py-3 font-medium">Fulfillment status</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Delivery status</th>
              <th className="px-4 py-3 font-medium">Delivery method</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className={`border-b border-purple-50 last:border-0 hover:bg-cream/40 ${
                  selected.has(o.id) ? "bg-purple-50/40" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={() => toggle(o.id)}
                    aria-label={`Select order ${o.orderNumber}`}
                    className="h-4 w-4 rounded accent-purple-600"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-semibold text-purple-900 hover:text-purple-700"
                  >
                    #{o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-purple-900/70">{o.date}</td>
                <td className="px-4 py-3 text-purple-900/80">{o.customerName}</td>
                <td className="px-4 py-3 text-purple-900/70">{o.channel}</td>
                <td className="px-4 py-3 text-right font-medium text-purple-900">
                  {formatPKR(o.total)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.fulfillmentStatus} />
                </td>
                <td className="px-4 py-3 text-purple-900/70">
                  {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                </td>
                <td className="px-4 py-3">
                  {o.deliveryStatus ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-purple-900/70">
                      <Truck className="h-3.5 w-3.5 text-purple-900/40" />
                      {o.deliveryStatus}
                    </span>
                  ) : (
                    <span className="text-xs text-purple-900/35">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-purple-900/70">
                  {o.deliveryMethod || <span className="text-purple-900/35">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-purple-50 lg:hidden">
        {orders.map((o) => (
          <li key={o.id} className="flex items-start gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={selected.has(o.id)}
              onChange={() => toggle(o.id)}
              aria-label={`Select order ${o.orderNumber}`}
              className="mt-1 h-4 w-4 shrink-0 rounded accent-purple-600"
            />
            <Link href={`/admin/orders/${o.id}`} className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-purple-900">#{o.orderNumber}</span>
                <span className="font-medium text-purple-900">{formatPKR(o.total)}</span>
              </div>
              <p className="truncate text-sm text-purple-900/70">{o.customerName}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={o.paymentStatus} />
                <StatusBadge status={o.fulfillmentStatus} />
                <span className="text-xs text-purple-900/50">
                  · {o.itemCount} item{o.itemCount === 1 ? "" : "s"} · {o.date}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
