import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Live admin search used by the top-bar dropdown. Returns a few matching
 * products, customers and orders as JSON. Guarded by the admin session (this
 * route is under /api so the /admin middleware doesn't cover it).
 */
export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ products: [], customers: [], orders: [] });

  const orderNum = Number(q.replace(/^#/, ""));
  const [products, customers, orders] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true, title: true, imageUrl: true, price: true },
      take: 5,
    }),
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { customerName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          ...(Number.isNaN(orderNum) ? [] : [{ orderNumber: orderNum }]),
        ],
      },
      select: { id: true, orderNumber: true, customerName: true, total: true, fulfillmentStatus: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ products, customers, orders });
}
