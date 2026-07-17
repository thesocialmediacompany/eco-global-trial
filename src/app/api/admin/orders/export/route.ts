import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

function csvCell(v: string | number) {
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(req: NextRequest) {
  // This route lives under /api so the /admin middleware doesn't cover it -   // guard it explicitly.
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const header = [
    "Order",
    "Date",
    "Customer",
    "Email",
    "Phone",
    "City",
    "Payment method",
    "Payment status",
    "Fulfillment",
    "Items",
    "Subtotal",
    "Shipping",
    "Discount",
    "Total",
    "Delivery method",
    "Courier",
    "Tracking",
    "Delivered at",
    "Tags",
  ];

  const rows = orders.map((o) =>
    [
      `#${o.orderNumber}`,
      o.createdAt.toISOString(),
      o.customerName,
      o.email,
      o.phone,
      o.city,
      o.paymentMethod,
      o.paymentStatus,
      o.fulfillmentStatus,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal,
      o.shipping,
      o.discount,
      o.total,
      o.shippingMethod,
      o.courier,
      o.trackingNumber,
      o.deliveredAt ? o.deliveredAt.toISOString() : "",
      o.tags,
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = [header.map(csvCell).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="egf-orders.csv"`,
    },
  });
}
