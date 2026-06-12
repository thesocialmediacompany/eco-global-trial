"use client";

import { useState } from "react";
import { Send, Mail, Eye } from "lucide-react";
import {
  renderCampaignEmail,
  type CampaignProduct,
} from "@/lib/campaign-template";

interface StoreInfo {
  storeName: string;
  storeLegalName: string;
  storePhone: string;
  storeEmail: string;
}

const input =
  "w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
const labelCls = "mb-1.5 block text-xs font-medium text-purple-900/70";

export function CampaignComposer({
  store,
  featuredProducts,
  activeCount,
  sendCampaign,
  sendTestCampaign,
}: {
  store: StoreInfo;
  featuredProducts: CampaignProduct[];
  activeCount: number;
  sendCampaign: (formData: FormData) => Promise<void>;
  sendTestCampaign: (formData: FormData) => Promise<void>;
}) {
  const [f, setF] = useState({
    subject: "",
    preheader: "",
    bannerImage: "",
    headline: "",
    body: "",
    ctaLabel: "",
    ctaUrl: "",
    includeProducts: false,
    testTo: "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const previewHtml = renderCampaignEmail({
    ...store,
    subject: f.subject,
    preheader: f.preheader,
    bannerImage: f.bannerImage,
    headline: f.headline,
    body: f.body || "Your message will appear here…",
    ctaLabel: f.ctaLabel,
    ctaUrl: f.ctaUrl,
    products: f.includeProducts ? featuredProducts : undefined,
    unsubscribeUrl: "#",
  }).html;

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Compose */}
      <div className="space-y-4 rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
        <label className="block">
          <span className={labelCls}>Subject</span>
          <input
            name="subject"
            required
            value={f.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="New flavours just landed 🌿"
            className={input}
          />
        </label>

        <label className="block">
          <span className={labelCls}>Preview text (inbox preview line)</span>
          <input
            name="preheader"
            value={f.preheader}
            onChange={(e) => set("preheader", e.target.value)}
            placeholder="Fresh granola, oats and more — 20% off this week"
            className={input}
          />
        </label>

        <label className="block">
          <span className={labelCls}>Banner image URL (optional)</span>
          <input
            name="bannerImage"
            value={f.bannerImage}
            onChange={(e) => set("bannerImage", e.target.value)}
            placeholder="https://…/banner.jpg"
            className={input}
          />
        </label>

        <label className="block">
          <span className={labelCls}>Headline</span>
          <input
            name="headline"
            value={f.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Eat better, not less"
            className={input}
          />
        </label>

        <label className="block">
          <span className={labelCls}>Message</span>
          <textarea
            name="body"
            required
            rows={7}
            value={f.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder={"Write your newsletter here.\n\nLeave a blank line between paragraphs."}
            className={input}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Button label (optional)</span>
            <input
              name="ctaLabel"
              value={f.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
              placeholder="Shop now"
              className={input}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Button link (optional)</span>
            <input
              name="ctaUrl"
              value={f.ctaUrl}
              onChange={(e) => set("ctaUrl", e.target.value)}
              placeholder="https://www.ecoglobalfoods.com/shop"
              className={input}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-purple-900/80">
          <input
            type="checkbox"
            name="includeProducts"
            checked={f.includeProducts}
            onChange={(e) => set("includeProducts", e.target.checked)}
            className="h-4 w-4 rounded accent-green-600"
          />
          Add a row of featured products ({featuredProducts.length})
        </label>

        {/* Test + send */}
        <div className="flex flex-col gap-3 border-t border-purple-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-2">
            <label className="block">
              <span className={labelCls}>Send a test to</span>
              <input
                name="testTo"
                type="email"
                value={f.testTo}
                onChange={(e) => set("testTo", e.target.value)}
                placeholder="you@example.com"
                className={`${input} sm:w-52`}
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
            <Send className="h-4 w-4" /> Send to {activeCount}
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-20 lg:h-fit">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-purple-900/60">
          <Eye className="h-3.5 w-3.5" /> Live preview
        </p>
        <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            className="h-[560px] w-full"
          />
        </div>
      </div>
    </form>
  );
}
