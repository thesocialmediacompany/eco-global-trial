import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LOOKS_LIKE_EMAIL } from "@/lib/utils";

/**
 * Capture an in-progress checkout. The checkout form posts here (debounced)
 * once a shopper has typed a complete-looking email, so we can follow up on
 * carts that are never placed. Marked `recovered` when an order is placed.
 *
 * The address is re-checked here rather than trusting the form: this is a
 * public endpoint, and a half-typed address can never be emailed and never
 * matches a real order, so it would sit in the abandoned list forever as a
 * false lead.
 */
export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    name?: string;
    phone?: string;
    city?: string;
    items?: unknown;
    subtotal?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!LOOKS_LIKE_EMAIL.test(email)) {
    return NextResponse.json({ ok: false, reason: "incomplete-email" }, { status: 200 });
  }

  const itemsJson = JSON.stringify(body.items ?? []);
  const subtotal = Math.max(0, Math.round(Number(body.subtotal) || 0));
  const name = String(body.name ?? "");
  const phone = String(body.phone ?? "");
  const city = String(body.city ?? "");

  const existing = await prisma.abandonedCheckout.findUnique({ where: { email } });

  if (!existing) {
    await prisma.abandonedCheckout.create({
      data: { email, name, phone, city, itemsJson, subtotal },
    });
    return NextResponse.json({ ok: true });
  }

  // Someone who already bought and is now filling a new cart starts a fresh
  // follow-up sequence. Someone still mid-checkout keeps their count, so a
  // keystroke can't re-trigger a nudge they have already been sent.
  const startingOver = existing.recovered;

  await prisma.abandonedCheckout.update({
    where: { email },
    data: {
      name,
      phone,
      city,
      itemsJson,
      subtotal,
      recovered: false,
      ...(startingOver
        ? { recoveryCount: 0, recoveryEmailSentAt: null, createdAt: new Date() }
        : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
