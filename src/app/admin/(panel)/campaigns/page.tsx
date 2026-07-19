import { formatDateTime as formatDate } from "@/lib/dates";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getFeaturedProducts } from "@/lib/products";
import { CampaignComposer } from "@/components/admin/CampaignComposer";
import { sendCampaign, sendTestCampaign } from "./actions";


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";

export default async function CampaignsPage() {
  const [activeCount, past, settings, featured] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    getSettings(),
    getFeaturedProducts(4),
  ]);

  const featuredProducts = featured.map((p) => ({
    title: p.name,
    price: p.price,
    imageUrl: p.imageUrl ?? null,
    url: `${siteUrl}/product/${p.slug}`,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-purple-900">
          Newsletter campaigns
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-purple-900/60">
          <Users className="h-4 w-4" /> {activeCount} active subscriber
          {activeCount === 1 ? "" : "s"} will receive this.
        </p>
      </div>

      <CampaignComposer
        store={{
          storeName: settings.storeName,
          storeLegalName: settings.storeLegalName,
          storePhone: settings.storePhone,
          storeEmail: settings.storeEmail,
        }}
        featuredProducts={featuredProducts}
        activeCount={activeCount}
        sendCampaign={sendCampaign}
        sendTestCampaign={sendTestCampaign}
      />

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
