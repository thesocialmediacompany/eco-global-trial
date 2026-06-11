import { Send, Mail, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sendCampaign, sendTestCampaign } from "./actions";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

const input =
  "w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";

export default async function CampaignsPage() {
  const [activeCount, past] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-purple-900">
          Newsletter campaigns
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-purple-900/60">
          <Users className="h-4 w-4" /> {activeCount} active subscriber
          {activeCount === 1 ? "" : "s"} will receive this.
        </p>
      </div>

      {/* Compose */}
      <form className="space-y-4 rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Subject</span>
          <input name="subject" required placeholder="e.g. New flavours just landed 🌿" className={input} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
            Message
          </span>
          <textarea
            name="body"
            required
            rows={8}
            placeholder={"Write your newsletter here.\n\nLeave a blank line between paragraphs."}
            className={input}
          />
          <span className="mt-1 block text-[0.7rem] text-purple-900/40">
            Plain text. A blank line starts a new paragraph. An unsubscribe link is
            added automatically.
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
              Button label (optional)
            </span>
            <input name="ctaLabel" placeholder="Shop now" className={input} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
              Button link (optional)
            </span>
            <input name="ctaUrl" placeholder="https://www.ecoglobalfoods.com/shop" className={input} />
          </label>
        </div>

        {/* Test + send */}
        <div className="flex flex-col gap-3 border-t border-purple-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                Send a test to
              </span>
              <input
                name="testTo"
                type="email"
                placeholder="you@example.com"
                className={`${input} sm:w-56`}
              />
            </label>
            <button
              formAction={sendTestCampaign}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
            >
              <Mail className="h-4 w-4" /> Send test
            </button>
          </div>

          <button
            formAction={sendCampaign}
            className="inline-flex items-center justify-center gap-2 rounded-lg gradient-purple-green px-5 py-2.5 text-sm font-semibold text-cream shadow-sm"
          >
            <Send className="h-4 w-4" /> Send to {activeCount} subscriber
            {activeCount === 1 ? "" : "s"}
          </button>
        </div>
      </form>

      {/* Past campaigns */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-purple-900">
          Sent campaigns
        </h2>
        {past.length === 0 ? (
          <div className="rounded-xl border border-dashed border-purple-200 bg-white/60 py-10 text-center text-sm text-purple-900/50">
            No campaigns sent yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Recipients</th>
                  <th className="px-5 py-3 font-medium">Sent</th>
                </tr>
              </thead>
              <tbody>
                {past.map((c) => (
                  <tr key={c.id} className="border-b border-purple-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-purple-900">{c.subject}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-purple-900/70">{c.sentCount}</td>
                    <td className="px-5 py-3 text-purple-900/60">
                      {c.sentAt ? formatDate(c.sentAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-6 rounded-lg bg-cream/60 px-4 py-3 text-xs text-purple-900/55">
        Emails only send once SMTP is configured (otherwise they log to the server for
        testing). Always &ldquo;Send test&rdquo; to yourself first.
      </p>
    </div>
  );
}
