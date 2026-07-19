import "server-only";
import { formatDayMonthLong } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-guard";

/**
 * An order's timeline.
 *
 * Events are written by the actions that change an order, so the history says
 * what actually happened rather than being re-derived from the order's current
 * state. Recording is best-effort: a timeline write must never be the reason a
 * fulfilment or a payment fails, so failures log and move on.
 */

export type OrderEventKind =
  | "placed"
  | "paid"
  | "fulfilled"
  | "delivered"
  | "courier"
  | "email"
  | "refund"
  | "cancel"
  | "archive"
  | "comment";

export async function recordOrderEvent(
  orderId: string,
  kind: OrderEventKind,
  message: string,
  actor?: string,
) {
  try {
    // Attribute manual actions to whoever is signed in, unless told otherwise.
    const who = actor ?? (await getAdminSession())?.name ?? "";
    await prisma.orderEvent.create({
      data: { orderId, kind, message, actor: who },
    });
  } catch (err) {
    console.warn("[order-events] failed to record:", err instanceof Error ? err.message : err);
  }
}

/** Same, but for contexts with no admin session (e.g. storefront checkout). */
export async function recordSystemOrderEvent(
  orderId: string,
  kind: OrderEventKind,
  message: string,
) {
  return recordOrderEvent(orderId, kind, message, "");
}

export interface TimelineEntry {
  id: string;
  kind: string;
  message: string;
  actor: string;
  createdAt: Date;
}

/**
 * Timeline for an order, newest first.
 *
 * Orders placed before this feature existed have no recorded events. We only
 * genuinely know when such an order was created, so we synthesise that single
 * entry rather than inventing timestamps for payment or fulfilment that were
 * never recorded.
 */
export async function getOrderTimeline(order: {
  id: string;
  orderNumber: number;
  customerName: string;
  createdAt: Date;
  isDraft: boolean;
}): Promise<TimelineEntry[]> {
  let events: TimelineEntry[] = [];
  try {
    events = await prisma.orderEvent.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("[order-events] read failed:", err instanceof Error ? err.message : err);
    return [];
  }

  const hasPlaced = events.some((e) => e.kind === "placed");
  if (!hasPlaced) {
    events.push({
      id: `synthetic-placed-${order.id}`,
      kind: "placed",
      message: order.isDraft
        ? `Draft order created for ${order.customerName}.`
        : `${order.customerName} placed this order on Online Store.`,
      actor: "",
      createdAt: order.createdAt,
    });
  }

  return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Group timeline entries under a day heading, the way Shopify does. */
export function groupByDay(entries: TimelineEntry[]) {
  const groups: { day: string; entries: TimelineEntry[] }[] = [];
  for (const e of entries) {
    const day = formatDayMonthLong(e.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.entries.push(e);
    else groups.push({ day, entries: [e] });
  }
  return groups;
}
