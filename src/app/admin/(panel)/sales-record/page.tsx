import Link from "next/link";
import { Download, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { requireOwner } from "@/lib/admin-guard";
import { formatPKR } from "@/lib/utils";
import { getSalesReport, resolveSalesRange } from "@/lib/sales-report";

const ACCENT = "#5e3052";

const PRESETS = [
  { label: "FY to date", value: "fytd" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "12 months", value: "1y" },
  { label: "All time", value: "all" },
];

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" }).format(d);
}
function isoDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(d);
}

export default async function SalesRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; cancelled?: string }>;
}) {
  await requireOwner();
  const params = await searchParams;
  const custom = Boolean(params.from);
  const includeCancelled = params.cancelled === "1";
  const { from, to, key, label } = resolveSalesRange(params);
  const report = await getSalesReport({ from, to, includeCancelled });

  // Preserve range + cancelled in the export/preset links.
  const qs = (over: Record<string, string | undefined>) => {
    const base: Record<string, string | undefined> = {
      range: custom ? undefined : key,
      from: custom ? isoDate(from) : undefined,
      to: custom ? isoDate(to) : undefined,
      cancelled: includeCancelled ? "1" : undefined,
      ...over,
    };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const maxUnits = Math.max(1, ...report.byCategory.map((c) => c.units));

  const stats = [
    { label: "Units sold", value: report.totals.units.toLocaleString(), icon: Package },
    { label: "Revenue", value: formatPKR(report.totals.revenue), icon: TrendingUp },
    { label: "Order lines", value: report.totals.lines.toLocaleString(), icon: ShoppingCart },
  ];

  return (
    <div className="mx-auto max-w-6xl text-slate-700">
      {/* Header + range controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sales record</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {label} · {fmtDate(from)} – {fmtDate(to)} · placed orders{includeCancelled ? ", incl. cancelled" : ", excl. cancelled"}
          </p>
        </div>
        <a
          href={`/admin/sales-record/export${qs({})}`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5e3052] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a2341]"
        >
          <Download className="h-4 w-4" /> Download CSV
        </a>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => {
          const active = !custom && key === p.value;
          return (
            <Link
              key={p.value}
              href={`/admin/sales-record${qs({ range: p.value, from: undefined, to: undefined })}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active ? "bg-[#5e3052] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
        <form method="GET" className="flex items-center gap-1">
          <input type="date" name="from" defaultValue={custom ? isoDate(from) : ""}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#5e3052]" />
          <span className="text-xs text-slate-400">to</span>
          <input type="date" name="to" defaultValue={custom ? isoDate(to) : ""}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#5e3052]" />
          {includeCancelled && <input type="hidden" name="cancelled" value="1" />}
          <button type="submit" className="rounded-lg bg-[#5e3052] px-3 py-1 text-xs font-semibold text-white hover:bg-[#4a2341]">Apply</button>
        </form>
        <Link
          href={`/admin/sales-record${qs({ cancelled: includeCancelled ? undefined : "1" })}`}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            includeCancelled ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {includeCancelled ? "✓ Incl. cancelled" : "Incl. cancelled"}
        </Link>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</span>
              <s.icon className="h-4 w-4 text-slate-300" />
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      {report.totals.lines === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-sm text-slate-400">
          No sales in this period.
        </p>
      ) : (
        <>
          {/* By category */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-medium text-slate-500">By category (item type)</h2>
            <div className="space-y-4">
              {report.byCategory.map((c) => (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{c.category}</span>
                    <span className="tabular-nums text-slate-500">{c.units} units · {formatPKR(c.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${(c.units / maxUnits) * 100}%`, backgroundColor: ACCENT }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By product + variant */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-medium text-slate-500">By product &amp; variant ({report.byItem.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">Variant</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 pr-3 text-right font-medium">Units</th>
                    <th className="py-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byItem.map((r, i) => (
                    <tr key={`${r.product}-${r.variant}-${i}`} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 text-slate-800">{r.product}</td>
                      <td className="py-2 pr-3 text-slate-500">{r.variant || "—"}</td>
                      <td className="py-2 pr-3 text-slate-500">{r.category}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-slate-800">{r.units}</td>
                      <td className="py-2 text-right tabular-nums text-slate-800">{formatPKR(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
