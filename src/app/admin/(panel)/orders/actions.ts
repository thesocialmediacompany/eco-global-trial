"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getShippingProvider } from "@/lib/shipping";
import {
  sendOrderConfirmation,
  sendShippingNotification,
  sendReviewRequest,
} from "@/lib/email";

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

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${order.id}`);
}

/** Convert a draft order into a placed order. */
export async function placeDraftOrder(orderId: string) {
  await prisma.order.update({ where: { id: orderId }, data: { isDraft: false } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function resendConfirmation(orderId: string) {
  await sendOrderConfirmation(orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}

/** Send (or resend) the "your order has shipped" email with courier + tracking. */
export async function notifyShipped(orderId: string) {
  await sendShippingNotification(orderId).catch((e) =>
    console.error("shipping email failed:", e),
  );
  revalidatePath(`/admin/orders/${orderId}`);
}

/** Ask the customer to review the products they bought (post-delivery). */
export async function requestReview(orderId: string) {
  await sendReviewRequest(orderId).catch((e) =>
    console.error("review request email failed:", e),
  );
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function markPaid(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "paid" },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function markFulfilled(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { fulfillmentStatus: "fulfilled" },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/** Mark several orders fulfilled at once (bulk action from the orders list). */
export async function bulkFulfillOrders(ids: string[]) {
  const clean = ids.filter(Boolean);
  if (!clean.length) return;
  await prisma.order.updateMany({
    where: { id: { in: clean }, fulfillmentStatus: { not: "cancelled" } },
    data: { fulfillmentStatus: "fulfilled" },
  });
  revalidatePath("/admin/orders");
}

/** Mark an order's payment as refunded. */
export async function refundOrder(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "refunded" },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
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

  // Resolve which variant each line maps to (queries run now)...
  const lookups = await Promise.all(
    order.items.map(async (it) => {
      if (!it.productId) return null;
      const variant = await prisma.variant.findFirst({
        where: { productId: it.productId, title: it.variantTitle },
      });
      return variant ? { variantId: variant.id, quantity: it.quantity } : null;
    }),
  );

  // ...then batch the restock increments + the status flip into one transaction.
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

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/**
 * Book the order with ZoomCOD (https://zoomcod.com) via the pluggable shipping
 * adapter. Swapping couriers is a one-line change in @/lib/shipping.
 */
export async function bookZoomCOD(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const provider = getShippingProvider("zoomcod");
  const result = await provider.bookShipment({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    city: order.city,
    amount: order.total,
  });

  if (result.status === "booked") {
    await prisma.order.update({
      where: { id: orderId },
      data: { courier: result.courier, trackingNumber: result.trackingNumber },
    });
    // Let the customer know it's on the way, with the fresh tracking number.
    await sendShippingNotification(orderId).catch((e) =>
      console.error("shipping email failed:", e),
    );
  }
  revalidatePath(`/admin/orders/${orderId}`);
}
