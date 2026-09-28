import { NextRequest } from "next/server";
import { requireOwner } from "@/lib/admin-guard";
import { getSalesReport, resolveSalesRange, salesReportCsv } from "@/lib/sales-report";

/** CSV download for the Sales Record page — honours the same range filters. */
export async function GET(req: NextRequest) {
  await requireOwner();

  const sp = req.nextUrl.searchParams;
  const { from, to } = resolveSalesRange({
    range: sp.get("range") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });
  const includeCancelled = sp.get("cancelled") === "1";
  const report = await getSalesReport({ from, to, includeCancelled });

  const fmt = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(d);
  const filename = `sales-record_${fmt(report.from)}_to_${fmt(report.to)}.csv`;

  return new Response(salesReportCsv(report), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
