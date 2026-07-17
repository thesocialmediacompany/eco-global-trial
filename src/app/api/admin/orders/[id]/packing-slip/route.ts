import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { renderPackingSlipPdf } from "@/lib/packing-slip-pdf";

/**
 * The packing slip as a clean PDF. Lives under /api so the /admin middleware
 * doesn't cover it; guarded here. Generated with react-pdf (no browser), so the
 * file has none of the date/URL/page-number headers a browser stamps on print.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdf = await renderPackingSlipPdf(order, settings);

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      // inline so it opens in a new tab; the browser's own Save button keeps it.
      "Content-Disposition": `inline; filename="packing-slip-${order.orderNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
