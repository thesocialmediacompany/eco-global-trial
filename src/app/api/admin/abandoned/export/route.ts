import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

function csvCell(v: string | number) {
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

/**
 * Abandoned checkouts as CSV, for working the list outside the admin.
 * Lives under /api so the /admin middleware doesn't cover it; guarded here.
 */
export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const carts = await prisma.abandonedCheckout.findMany({
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Checkout",
    "Created",
    "Customer name",
    "Email",
    "Phone",
    "City",
    "Items",
    "Subtotal",
    "Recovery status",
    "Nudges sent",
    "Last nudge",
  ];

  const rows = carts.map((c) => {
    let itemCount = 0;
    try {
      itemCount = (JSON.parse(c.itemsJson) as { quantity: number }[]).reduce(
        (s, i) => s + (i.quantity ?? 0),
        0,
      );
    } catch {
      itemCount = 0;
    }
    return [
      `#${c.id.slice(-8).toUpperCase()}`,
      c.createdAt.toISOString(),
      c.name,
      c.email,
      c.phone,
      c.city,
      itemCount,
      c.subtotal,
      c.recovered ? "Recovered" : "Not recovered",
      c.recoveryCount,
      c.recoveryEmailSentAt ? c.recoveryEmailSentAt.toISOString() : "",
    ]
      .map(csvCell)
      .join(",");
  });

  const csv = [header.map(csvCell).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="egf-abandoned-checkouts.csv"`,
    },
  });
}
