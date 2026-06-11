import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Capture an in-progress checkout. The checkout form posts here (debounced)
 * once a shopper enters their email - so we can follow up on carts that aren't
 * completed. Marked `recovered` automatically when an order is placed.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; phone?: string; items?: unknown; subtotal?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const itemsJson = JSON.stringify(body.items ?? []);
  const subtotal = Math.max(0, Math.round(Number(body.subtotal) || 0));

  await prisma.abandonedCheckout.upsert({
    where: { email },
    update: {
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      itemsJson,
      subtotal,
      recovered: false,
    },
    create: {
      email,
      name: String(body.name ?? ""),
      phone: String(body.phone ?? ""),
      itemsJson,
      subtotal,
    },
  });

  return NextResponse.json({ ok: true });
}
