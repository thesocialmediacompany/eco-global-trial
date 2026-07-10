"use server";

import { prisma } from "@/lib/prisma";
import { initialPaymentStatus, type PaymentMethodId } from "@/lib/payments";
import { sendOrderConfirmation, sendShippingNotification } from "@/lib/email";
import { getShippingConfig } from "@/lib/shipping-config";
import { computeShipping } from "@/lib/shipping-rates";
import { createZoomCODOrder } from "@/lib/zoomcod";


export interface PlaceOrderInput {
  items: { productId: string; variantTitle: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  paymentMethod: PaymentMethodId;
  discountCode?: string;
  note?: string;
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: number }
  | { ok: false; error: string };

/** Validate a discount code against the (server-computed) subtotal. */
async function resolveDiscount(code: string | undefined, subtotal: number) {
  if (!code) return { discount: 0, freeShipping: false, code: "" };
  const d = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });
  if (!d || !d.active) return { discount: 0, freeShipping: false, code: "" };
  if (d.startsAt && d.startsAt > new Date()) return { discount: 0, freeShipping: false, code: "" };
  if (d.endsAt && d.endsAt < new Date()) return { discount: 0, freeShipping: false, code: "" };
  if (d.usageLimit && d.usedCount >= d.usageLimit) return { discount: 0, freeShipping: false, code: "" };
  if (subtotal < d.minSubtotal) return { discount: 0, freeShipping: false, code: "" };

  if (d.type === "percentage") {
    return { discount: Math.round((subtotal * d.value) / 100), freeShipping: false, code: d.code };
  }
  if (d.type === "fixed") {
    return { discount: Math.min(d.value, subtotal), freeShipping: false, code: d.code };
  }
  if (d.type === "free_shipping") {
    return { discount: 0, freeShipping: true, code: d.code };
  }
  return { discount: 0, freeShipping: false, code: "" };
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const { items, customer, paymentMethod } = input;

  if (!items?.length) return { ok: false, error: "Your cart is empty." };
  if (!customer.name || !customer.phone || !customer.address || !customer.city) {
    return { ok: false, error: "Please fill in all required fields." };
  }

  // Recompute prices server-side (never trust client prices).
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lineItems = items.map((it) => {
    const product = byId.get(it.productId);
    if (!product) return null;
    const variant = product.variants.find((v) => v.title === it.variantTitle);
    const price = variant?.price ?? product.price;
    const weightGrams = variant?.weightGrams ?? product.variants[0]?.weightGrams ?? 0;
    const quantity = Math.max(1, it.quantity);
    return {
      productId: product.id,
      title: product.title,
      variantTitle: it.variantTitle,
      quantity,
      price,
      weightGrams,
      total: price * quantity,
      variantId: variant?.id ?? null,
      available: variant?.available ?? true,
      inStock: variant?.inventoryQty ?? 0,
    };
  });

  if (lineItems.some((l) => l === null)) {
    return { ok: false, error: "Some items are no longer available." };
  }
  const validItems = lineItems as NonNullable<(typeof lineItems)[number]>[];

  // Stock guard: never let an order exceed available inventory (no overselling).
  const oversold = validItems.find(
    (l) => l.variantId && (!l.available || l.quantity > l.inStock),
  );
  if (oversold) {
    const name = oversold.variantTitle
      ? `${oversold.title} (${oversold.variantTitle})`
      : oversold.title;
    return {
      ok: false,
      error:
        oversold.inStock <= 0 || !oversold.available
          ? `Sorry, ${name} just went out of stock.`
          : `Only ${oversold.inStock} of ${name} left in stock. Please reduce the quantity.`,
    };
  }

  const subtotal = validItems.reduce((s, l) => s + l.total, 0);
  const { discount, freeShipping, code } = await resolveDiscount(
    input.discountCode,
    subtotal,
  );

  // Authoritative weight-based shipping from the configured rate bands.
  const totalGrams = validItems.reduce(
    (s, l) => s + l.weightGrams * l.quantity,
    0,
  );
  const shippingConfig = await getShippingConfig();
  const shipping = computeShipping(
    totalGrams,
    subtotal - discount,
    shippingConfig,
    freeShipping,
  );
  const total = Math.max(0, subtotal - discount + shipping);

  // OrderItem rows don't store weight; keep only the persisted columns.
  const orderItemData = validItems.map((l) => ({
    productId: l.productId,
    title: l.title,
    variantTitle: l.variantTitle,
    quantity: l.quantity,
    price: l.price,
    total: l.total,
  }));

  // next order number
  const agg = await prisma.order.aggregate({ _max: { orderNumber: true } });
  const orderNumber = (agg._max.orderNumber ?? 1000) + 1;

  // upsert customer by email (fallback to phone-based pseudo email)
  const email = customer.email || `${customer.phone.replace(/\D/g, "")}@guest.egf`;
  const customerRecord = await prisma.customer.upsert({
    where: { email },
    update: {
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
    },
    create: {
      name: customer.name,
      email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
    },
  });

  // Create the order and decrement inventory atomically so two shoppers can
  // never both claim the last unit.
  const decrements = validItems
    .filter((l) => l.variantId)
    .map((l) =>
      prisma.variant.update({
        where: { id: l.variantId! },
        data: { inventoryQty: { decrement: l.quantity } },
      }),
    );

  const [createdOrder] = await prisma.$transaction([
    prisma.order.create({
      data: {
        orderNumber,
        customerId: customerRecord.id,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        subtotal,
        shipping,
        discount,
        discountCode: code,
        total,
        paymentMethod,
        paymentStatus: initialPaymentStatus(paymentMethod),
        fulfillmentStatus: "unfulfilled",
        note: input.note ?? "",
        items: { create: orderItemData },
      },
    }),
    ...decrements,
  ]);

  // Count the discount usage (powers the usage-limit condition).
  if (code) {
    await prisma.discount
      .update({ where: { code }, data: { usedCount: { increment: 1 } } })
      .catch(() => {});
  }

  // Mark any abandoned checkout for this email as recovered.
  if (customer.email) {
    await prisma.abandonedCheckout
      .updateMany({ where: { email: customer.email.toLowerCase() }, data: { recovered: true } })
      .catch(() => {});
  }

 // ── ZoomCOD: book a COD shipment automatically ─────────────────────────────
  if (paymentMethod === "cod") {
    try {
      const productDescription = validItems
        .map((l) => `${l.title}${l.variantTitle ? ` (${l.variantTitle})` : ""} x${l.quantity}`)
        .join(", ");

      const zoomResult = await createZoomCODOrder({
        receiverName: customer.name,
        receiverPhone: customer.phone,
        receiverEmail: customer.email || undefined,
        receiverAddress: customer.address,
        destination: customer.city,
        collectionAmount: total,
        productDescription,
        weightKg: Math.max(0.5, Math.round((totalGrams / 1000) * 10) / 10),
        pieces: validItems.reduce((s, l) => s + l.quantity, 0),
        orderId: orderNumber,
      });

      await prisma.order.update({
        where: { id: createdOrder.id },
        data: {
          courier: zoomResult.thirdPartyName || "ZoomCOD",
          trackingNumber: zoomResult.trackingNo,
          shipmentLabelUrl: zoomResult.invoiceLink,
          courierStatus: "New Booked",
        },
      });
      await sendShippingNotification(createdOrder.id).catch(() => {});
    } catch (e) {
      console.error("ZoomCOD booking failed for order", orderNumber, e);
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  // Order confirmation email (never block/fail the order on email errors).
  try {
    await sendOrderConfirmation(createdOrder.id);
  } catch (e) {
    console.error("order confirmation email failed:", e);
  }

  return { ok: true, orderNumber };
}