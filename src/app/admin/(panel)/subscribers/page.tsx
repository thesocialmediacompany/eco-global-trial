import { formatDateTime as formatDate } from "@/lib/dates";
import { Mail, Trash2, Download, Check, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteSubscriber, toggleSubscriber } from "./actions";


export default async function SubscribersPage() {
  const [subs, reminders] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.reorderReminder.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const activeCount = subs.filter((s) => s.active).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">
            Newsletter subscribers
          </h1>
          <p className="mt-1 text-sm text-purple-900/60">
            {activeCount} active · {subs.length} total
          </p>
        </div>
        {subs.length > 0 && (
          <a
            href="/api/admin/subscribers/export"
            className="inline-flex items-center gap-2 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream shadow-sm"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        )}
      </div>

      {subs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-purple-200 bg-white/60 py-16 text-center text-purple-900/50">
          No subscribers yet. Signups from the storefront newsletter appear here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-purple-50 last:border-0 hover:bg-cream/40"
                >
                  <td className="px-5 py-3">
                    <a
                      href={`mailto:${sub.email}`}
                      className="flex items-center gap-2 font-medium text-purple-900 hover:text-purple-700"
                    >
                      <Mail className="h-3.5 w-3.5 text-purple-900/40" /> {sub.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-purple-900/60">{sub.source}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        sub.active
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {sub.active ? "Subscribed" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-purple-900/60">
                    {formatDate(sub.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <form action={toggleSubscriber.bind(null, sub.id)}>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-purple-50 hover:text-purple-700"
                          title={sub.active ? "Mark unsubscribed" : "Re-activate"}
                        >
                          {sub.active ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      </form>
                      <form action={deleteSubscriber.bind(null, sub.id)}>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                          aria-label="Delete subscriber"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subscribe & Save reorder reminders */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-purple-900">
          Subscribe &amp; Save reminders
        </h2>
        <p className="mt-1 text-sm text-purple-900/60">
          {reminders.length} active · customers who want a reorder nudge (Cash on
          Delivery, no auto-charge).
        </p>
        {reminders.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-purple-200 bg-white/60 py-10 text-center text-sm text-purple-900/50">
            No reorder reminders yet.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Every</th>
                  <th className="px-5 py-3 font-medium">Since</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-purple-50 last:border-0 hover:bg-cream/40"
                  >
                    <td className="px-5 py-3">
                      <a
                        href={`mailto:${r.email}`}
                        className="font-medium text-purple-900 hover:text-purple-700"
                      >
                        {r.email}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-purple-900/70">
                      {r.productSlug ? (
                        <a
                          href={`/product/${r.productSlug}`}
                          className="hover:text-purple-900"
                        >
                          {r.productTitle || r.productSlug}
                        </a>
                      ) : (
                        "Any"
                      )}
                    </td>
                    <td className="px-5 py-3 text-purple-900/70">
                      {r.frequencyWeeks} week{r.frequencyWeeks === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-3 text-purple-900/60">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
