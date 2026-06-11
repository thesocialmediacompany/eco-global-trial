import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallback } from "@/lib/payments-gateway";

/**
 * Generic payment-gateway callback endpoint.
 *   /api/payments/jazzcash/callback
 *   /api/payments/easypaisa/callback
 *   /api/payments/card/callback
 *
 * The gateway redirects/POSTs here after payment. We verify the signature,
 * mark the matching order paid, then send the customer to the confirmation
 * page. Until a provider's verifyCallback() is implemented it returns false,
 * so nothing is marked paid by an unverified request - safe by default.
 */
async function handle(req: NextRequest, provider: string) {
  const url = new URL(req.url);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (params[k] = v));

  if (req.method === "POST") {
    try {
      const form = await req.formData();
      form.forEach((v, k) => (params[k] = String(v)));
    } catch {
      /* ignore non-form bodies */
    }
  }

  // Your checkout should pass the order number as the gateway's reference.
  const orderNumber = Number(params.orderNumber ?? params.pp_BillReference ?? params.ref);
  const ok = await verifyCallback(provider, params);

  if (ok && Number.isFinite(orderNumber)) {
    await prisma.order.updateMany({
      where: { orderNumber },
      data: { paymentStatus: "paid" },
    });
  }

  const dest = Number.isFinite(orderNumber)
    ? `/order/${orderNumber}`
    : "/account";
  return NextResponse.redirect(new URL(dest, req.url));
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  return handle(req, provider);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  return handle(req, provider);
}
