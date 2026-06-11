import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

function csvCell(v: string | number) {
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET(req: NextRequest) {
  // Lives under /api so the /admin middleware doesn't cover it - guard here.
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subs = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const header = ["Email", "Source", "Status", "Joined"];
  const rows = subs.map((s) =>
    [s.email, s.source, s.active ? "subscribed" : "unsubscribed", s.createdAt.toISOString()]
      .map(csvCell)
      .join(","),
  );
  const csv = [header.map(csvCell).join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="egf-subscribers.csv"`,
    },
  });
}
