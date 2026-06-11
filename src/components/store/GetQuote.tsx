"use client";

import { useState } from "react";
import { Package2 } from "lucide-react";
import { WhatsAppIcon, waLink } from "@/components/site/FloatingButtons";

/**
 * Bulk-buyer quote request. Composes a WhatsApp message from the form and
 * opens a wa.me chat with the store's number (no backend needed); replies
 * land straight in the business WhatsApp.
 */
export function GetQuote({ whatsappNumber }: { whatsappNumber: string }) {
  const [form, setForm] = useState({ name: "", company: "", product: "", quantity: "" });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const message = [
    "Hello Eco Global Foods! 🌿",
    "I'd like to request a *bulk purchase quote*.",
    form.name && `Name: ${form.name}`,
    form.company && `Company: ${form.company}`,
    form.product && `Product(s): ${form.product}`,
    form.quantity && `Quantity: ${form.quantity}`,
    "Please share pricing and packaging options. Thank you!",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="overflow-hidden rounded-[2rem] gradient-purple-green p-1 shadow-2xl shadow-purple-900/20">
      <div className="grid gap-8 rounded-[1.85rem] bg-purple-950/20 p-8 sm:p-10 lg:grid-cols-[1.1fr_1fr]">
        {/* pitch */}
        <div className="text-cream">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
            <Package2 className="h-3.5 w-3.5 text-gold-300" /> For bulk buyers
          </span>
          <h3 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            Get a wholesale quote
          </h3>
          <p className="mt-3 max-w-md text-cream/80">
            Buying for a shop, restaurant or distribution? We do bulk loose packing,
            non-branded consumer packs, and own-brand packaging (we already supply
            Hyperstar &amp; Metro). Tell us what you need and we&apos;ll reply on WhatsApp.
          </p>
          <ul className="mt-5 space-y-1.5 text-sm text-cream/75">
            <li>✓ Bulk &amp; private-label packaging</li>
            <li>✓ ISO 22000, HACCP &amp; Halal certified</li>
            <li>✓ Nationwide delivery</li>
          </ul>
        </div>

        {/* form */}
        <div className="space-y-3 rounded-2xl bg-cream p-6">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            className={input}
          />
          <input
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Company / business (optional)"
            className={input}
          />
          <input
            value={form.product}
            onChange={(e) => set("product", e.target.value)}
            placeholder="Products of interest, e.g. rolled oats, spices"
            className={input}
          />
          <input
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="Approx. quantity, e.g. 200 kg / month"
            className={input}
          />
          <a
            href={waLink(whatsappNumber, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            <WhatsAppIcon className="h-5 w-5" /> Get a quote on WhatsApp
          </a>
          <p className="text-center text-xs text-purple-900/45">
            Opens WhatsApp with your request pre-filled.
          </p>
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
