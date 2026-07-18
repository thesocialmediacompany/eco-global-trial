"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getShippingProvider,
  cancelZoomCodShipment,
  zoomCodCurrentStatus,
} from "@/lib/shipping";
import {
  sendOrderConfirmation,
  sendShippingNotification,
  sendReviewRequest,
} from "@/lib/email";
import { recordOrderEvent } from "@/lib/order-events";
import { getAdminSession } from "@/lib/admin-guard";
import { formatPKR } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 7000;
const FLAT_SHIPPING = 250;

export interface ManualOrderInput {
  customer: { name: string; email: string; phone: string; address: string; city: string };
  items: { productId: string; variantTitle: string; quantity: number }[];
  paymentMethod: string;
  paymentStatus: string;
  isDraft?: boolean;
}

export type ManualOrderResult = { ok: true; id: string } | { ok: false; error: string };

/** Create an order manually from the admin (Shopify "Create order"). */
export async function createManualOrder(
  input: ManualOrderInput,
): Promise<ManualOrderResult> {
  const { customer, items, paymentMethod, paymentStatus } = input;
  if (!customer.name || !customer.phone) {
    return { ok: false, error: "Customer name and phone are required." };
  }
  const selected = items.filter((i) => i.quantity > 0);
  if (!selected.length) return { ok: false, error: "Add at least one product." };

  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(selected.map((i) => i.productId))] } },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lineItems = selected.map((it) => {
    const p = byId.get(it.productId)!;
    const variant = p.variants.find((v) => v.title === it.variantTitle);
    const price = variant?.price ?? p.price;
    return {
      productId: p.id,
      title: p.title,
      variantTitle: it.variantTitle,
      quantity: it.quantity,
      price,
      total: price * it.quantity,
    };
  });

  const subtotal = lineItems.reduce((s, l) => s + l.total, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

  const agg = await prisma.order.aggregate({ _max: { orderNumber: true } });
  const orderNumber = (agg._max.orderNumber ?? 1000) + 1;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      subtotal,
      shipping,
      total: subtotal + shipping,
      paymentMethod,
      paymentStatus,
      fulfillmentStatus: "unfulfilled",
      isDraft: input.isDraft ?? false,
      items: { create: lineItems },
    },
  });

  const staff = (await getAdminSession())?.name ?? "Staff";
  await recordOrderEvent(
    order.id,
    "placed",
    input.isDraft
      ? `${staff} created this draft order for ${customer.name}.`
      : `${staff} created this order for ${customer.name}.`,
  );

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${order.id}`);
}

/** Convert a draft order into a placed order. */
export async function placeDraftOrder(orderId: string) {
  await prisma.order.update({ where: { id: orderId }, data: { isDraft: false } });
  await recordOrderEvent(orderId, "placed", "Draft order was marked as placed.");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function resendConfirmation(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  await sendOrderConfirmation(orderId);
  await recordOrderEvent(
    orderId,
    "email",
    `Order confirmation email was resent to ${order?.customerName ?? "the customer"}${
      order?.email ? ` (${order.email})` : ""
    }.`,
  );
  revalidatePath(`/admin/orders/${orderId}`);
}

/** Send (or resend) the "your order has shipped" email with courier + tracking. */
export async function notifyShipped(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  await sendShippingNotification(orderId).catch((e) =>
    console.error("shipping email failed:", e),
  );
  await recordOrderEvent(
    orderId,
    "email",
    `Shipping notification was sent to ${order?.customerName ?? "the customer"}${
      order?.trackingNumber ? ` with tracking ${order.trackingNumber}` : ""
    }.`,
  );
  revalidatePath(`/admin/orders/${orderId}`);
}

/** Ask the customer to review the products they bought (post-delivery). */
export async function requestReview(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  await sendReviewRequest(orderId).catch((e) =>
    console.error("review request email failed:", e),
  );
  await recordOrderEvent(
    orderId,
    "email",
    `Review request was sent to ${order?.customerName ?? "the customer"}.`,
  );
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function markPaid(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "paid" },
  });
  const method = order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : order.paymentMethod;
  await recordOrderEvent(
    orderId,
    "paid",
    `You manually marked ${formatPKR(order.total)} as paid by ${method}.`,
  );
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function markFulfilled(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { fulfillmentStatus: "fulfilled" },
  });
  const count = await prisma.orderItem.aggregate({
    where: { orderId },
    _sum: { quantity: true },
  });
  await recordOrderEvent(
    orderId,
    "fulfilled",
    `${count._sum.quantity ?? 0} item${(count._sum.quantity ?? 0) === 1 ? "" : "s"} marked as fulfilled for order #${order.orderNumber}.`,
  );
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/**
 * Undo the dispatch step, returning the order to Unfulfilled — for a courier
 * booking made in error or a premature "mark fulfilled".
 *
 * Distinct from cancelling the order: the order stays live and stock stays
 * decremented, because it hasn't been returned, only un-dispatched. A booked
 * ZoomCOD shipment is cancelled and its tracking cleared, so the order doesn't
 * sit Unfulfilled while still carrying a live courier booking.
 */
export async function cancelFulfillment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.fulfillmentStatus !== "fulfilled") return;

  if (order.courier === "ZoomCOD" && order.trackingNumber) {
    const r = await cancelZoomCodShipment(order.trackingNumber);
    await recordOrderEvent(
      orderId,
      "courier",
      r.ok
        ? `ZoomCOD shipment ${order.trackingNumber} was cancelled.`
        : `Could not cancel ZoomCOD shipment ${order.trackingNumber}: ${r.message}. Cancel it in the ZoomCOD portal.`,
    );
    if (!r.ok) console.error("ZoomCOD cancel failed:", r.message);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      fulfillmentStatus: "unfulfilled",
      deliveredAt: null,
      courier: "",
      trackingNumber: "",
      shipmentLabelUrl: "",
      courierStatus: "",
    },
  });
  await recordOrderEvent(
    orderId,
    "fulfilled",
    "Fulfillment was cancelled. The order is back to unfulfilled.",
  );
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/** The rider confirmed handover. Separate from fulfilled, which is dispatch. */
export async function markDelivered(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { deliveredAt: new Date(), courierStatus: "Delivered" },
  });
  await recordOrderEvent(orderId, "delivered", "Order was marked as delivered.");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/** Clear a finished order out of the working list (Shopify's archive). */
export async function toggleArchive(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const archiving = !order.archivedAt;
  await prisma.order.update({
    where: { id: orderId },
    data: { archivedAt: archiving ? new Date() : null },
  });
  await recordOrderEvent(
    orderId,
    "archive",
    archiving ? "This order was archived." : "This order was unarchived.",
  );
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/** Mark several orders fulfilled at once (bulk action from the orders list). */
export async function bulkFulfillOrders(ids: string[]) {
  const clean = ids.filter(Boolean);
  if (!clean.length) return;
  const affected = await prisma.order.findMany({
    where: { id: { in: clean }, fulfillmentStatus: { not: "cancelled" } },
    select: { id: true },
  });
  await prisma.order.updateMany({
    where: { id: { in: affected.map((o) => o.id) } },
    data: { fulfillmentStatus: "fulfilled" },
  });
  // Only the orders that actually changed get a timeline entry.
  await Promise.all(
    affected.map((o) =>
      recordOrderEvent(o.id, "fulfilled", "Marked as fulfilled from the orders list."),
    ),
  );
  revalidatePath("/admin/orders");
}

/** Mark an order's payment as refunded. */
export async function refundOrder(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "refunded" },
  });
  await recordOrderEvent(orderId, "refund", `${formatPKR(order.total)} was refunded.`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/** Staff note on the order (Shopify's Notes card). */
export async function updateOrderNote(orderId: string, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim();
  await prisma.order.update({ where: { id: orderId }, data: { note } });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function addOrderTag(orderId: string, formData: FormData) {
  const tag = String(formData.get("tag") ?? "").trim();
  if (!tag) return;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const tags = order.tags.split(",").map((t) => t.trim()).filter(Boolean);
  if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return; // no duplicates
  await prisma.order.update({
    where: { id: orderId },
    data: { tags: [...tags, tag].join(",") },
  });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function removeOrderTag(orderId: string, formData: FormData) {
  const tag = String(formData.get("tag") ?? "");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const tags = order.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.toLowerCase() !== tag.toLowerCase());
  await prisma.order.update({ where: { id: orderId }, data: { tags: tags.join(",") } });
  revalidatePath(`/admin/orders/${orderId}`);
}

/** Staff-only comment posted into the timeline. */
export async function addOrderComment(orderId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await recordOrderEvent(orderId, "comment", body);
  revalidatePath(`/admin/orders/${orderId}`);
}

/**
 * Cancel an order: mark it cancelled and return its items to stock. Restocking
 * runs only on the first cancel (guarded by current status) so it can't double.
 */
export async function cancelOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.fulfillmentStatus === "cancelled") return;

  const lookups = await Promise.all(
    order.items.map(async (it) => {
      if (!it.productId) return null;
      const variant = await prisma.variant.findFirst({
        where: { productId: it.productId, title: it.variantTitle },
      });
      return variant ? { variantId: variant.id, quantity: it.quantity } : null;
    }),
  );

  const restockOps = lookups
    .filter((l): l is NonNullable<typeof l> => l !== null)
    .map((l) =>
      prisma.variant.update({
        where: { id: l.variantId },
        data: { inventoryQty: { increment: l.quantity } },
      }),
    );

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: "cancelled" },
    }),
    ...restockOps,
  ]);

  const restocked = restockOps.length;
  await recordOrderEvent(
    orderId,
    "cancel",
    `Order was cancelled${restocked ? ` and ${restocked} line${restocked === 1 ? "" : "s"} returned to stock` : ""}.`,
  );

  // If a ZoomCOD shipment was booked, cancel it too (best-effort).
  if (order.courier === "ZoomCOD" && order.trackingNumber) {
    const r = await cancelZoomCodShipment(order.trackingNumber);
    if (r.ok) {
      await prisma.order.update({ where: { id: orderId }, data: { courierStatus: "Cancelled" } });
      await recordOrderEvent(
        orderId,
        "courier",
        `ZoomCOD shipment ${order.trackingNumber} was cancelled.`,
      );
    } else {
      console.error("ZoomCOD cancel failed:", r.message);
      await recordOrderEvent(
        orderId,
        "courier",
        `Could not cancel the ZoomCOD shipment ${order.trackingNumber}: ${r.message}. Cancel it in the ZoomCOD portal.`,
      );
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/**
 * Book the order with ZoomCOD via the pluggable shipping adapter.
 * Computes real weight from order items + variants for accurate
 * product/service_type selection (Overnight vs Overland).
 */
export async function bookZoomCOD(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { variants: true } },
        },
      },
    },
  });
  if (!order) return;

  // Guard: already booked — prevent duplicate bookings
  if (order.trackingNumber) {
    return;
  }

  // Compute total weight from all line items


  const totalGrams = order.items.reduce((sum, item) => {
    const variant = item.product?.variants.find(
      (v) => v.title === item.variantTitle,
    );
    const grams = variant?.weightGrams ?? item.product?.variants[0]?.weightGrams ?? 0;
    const lineGrams = grams * item.quantity;


    return sum + lineGrams;
  }, 0);

  const weightKg = Math.round((totalGrams / 1000) * 10) / 10;
  const product = weightKg < 8 ? "Overnight" : "Overland";
  const serviceType = weightKg < 8 ? "Regular" : "Overland";



  // Build product description from line items
  const description = order.items
    .map(
      (it) =>
        `${it.title}${it.variantTitle ? ` (${it.variantTitle})` : ""} x${it.quantity}`,
    )
    .join(", ");

  const provider = getShippingProvider("zoomcod");
  const result = await provider.bookShipment({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    address: order.address,
    city: order.city,
    amount: order.total,
    weightKg,
    description,
  });



  if (result.status === "booked") {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        courier: result.courier,
        trackingNumber: result.trackingNumber,
        shipmentLabelUrl: result.labelUrl ?? "",
        courierStatus: "Order is Booked",
        fulfillmentStatus: "fulfilled",
      },
    });
    await recordOrderEvent(
      orderId,
      "courier",
      `${result.courier} booked this order for delivery (${weightKg} kg, ${product}). Tracking ${result.trackingNumber}.`,
    );
    await sendShippingNotification(orderId).catch((e) =>
      console.error("shipping email failed:", e),
    );
  } else {
    console.error("[ZoomCOD] Booking failed:", result.message);
    await recordOrderEvent(orderId, "courier", `ZoomCOD booking failed: ${result.message}`);
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

/** Pull the latest ZoomCOD status for an order's shipment. */
export async function refreshZoomCodStatus(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.trackingNumber) return;

  const status = await zoomCodCurrentStatus(order.trackingNumber);
  if (status) {
    await prisma.order.update({ where: { id: orderId }, data: { courierStatus: status } });
  }

  revalidatePath(`/admin/orders/${orderId}`);
}