import Link from "next/link";
import type { Prisma } from "@prisma/client";
import {
  Mail,
  Trash2,
  Check,
  Send,
  MessageCircle,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR, LOOKS_LIKE_EMAIL } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { AdminSearch } from "@/components/admin/AdminSearch";
import {
  FIRST_NUDGE_AFTER_MS,
  SECOND_NUDGE_AFTER_MS,
  GIVE_UP_AFTER_MS,
} from "@/lib/abandoned-recovery";
import { deleteAbandoned, markRecovered, sendRecoveryEmail } from "./actions";

const PAGE_SIZE = 50;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

type Item = { title: string; variantTitle?: string; quantity: number; price: number };

const tabs = [
  { key: "open", label: "Not recovered" },
  { key: "recovered", label: "Recovered" },
  { key: "all", label: "All" },
];

/** Pakistan phone → wa.me digits (international, no + or leading 0). */
function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1);
  else if (!d.startsWith("92") && d.length <= 10) d = "92" + d;
  return d;
}

function waRecoveryLink(
  cart: { phone: string; name: string; subtotal: number },
  items: Item[],
  storeName: string,
  siteUrl: string,
) {
  const first = cart.name.split(" ")[0] || "there";
  const list = items.map((i) => `• ${i.title}${i.variantTitle ? ` (${i.variantTitle})` : ""} × ${i.quantity}`).join("\n");
  const msg =
    `Assalam o Alaikum ${first}! 🌿 This is ${storeName}. We noticed you left some items in your cart:\n\n${list}\n\n` +
    `Total: ${formatPKR(cart.subtotal)}. Cash on delivery across Pakistan, no advance payment needed.\n\n` +
    `Would you like us to place the order for you? You can also finish here: ${siteUrl}/cart`;
  return `https://wa.me/${waNumber(cart.phone)}?text=${encodeURIComponent(msg)}`;
}

/** What the follow-up sequence will do next for a cart. */
function recoveryState(cart: {
  recovered: boolean;
  recoveryCount: number;
  createdAt: Date;
  email: string;
}) {
  if (cart.recovered) return { label: "Recovered", tone: "green" as const };
  if (!LOOKS_LIKE_EMAIL.test(cart.email))
    return { label: "Bad address", tone: "rose" as const };

  const age = Date.now() - cart.createdAt.getTime();
  if (age > GIVE_UP_AFTER_MS) return { label: "Not recovered", tone: "zinc" as const };
  if (cart.recoveryCount >= 2) return { label: "Not recovered", tone: "amber" as const };
  if (cart.recoveryCount === 1)
    return {
      label: age >= SECOND_NUDGE_AFTER_MS ? "2nd nudge due" : "1 nudge sent",
      tone: "purple" as const,
    };
  return {
    label: age >= FIRST_NUDGE_AFTER_MS ? "1st nudge due" : "Waiting",
    tone: "purple" as const,
  };
}

const TONES: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  purple: "bg-purple-100 text-purple-700",
  rose: "bg-rose-100 text-rose-700",
  zinc: "bg-zinc-100 text-zinc-600",
};

export default async function AbandonedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}) {
  const { tab = "open", q, page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);

  const base: Prisma.AbandonedCheckoutWhereInput =
    tab === "recovered" ? { recovered: true } : tab === "all" ? {} : { recovered: false };
  const search: Prisma.AbandonedCheckoutWhereInput | undefined = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;
  const where = search ? { AND: [base, search] } : base;

  const [carts, matching, openCount, recoveredCount, nudged, settings] = await Promise.all([
    prisma.abandonedCheckout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.abandonedCheckout.count({ where }),
    prisma.abandonedCheckout.count({ where: { recovered: false } }),
    prisma.abandonedCheckout.count({ where: { recovered: true } }),
    prisma.abandonedCheckout.count({ where: { recoveryCount: { gt: 0 } } }),
    getSettings(),
  ]);

  const total = openCount + recoveredCount;
  const rate = total > 0 ? Math.round((recoveredCount / total) * 100) : 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";

  const totalPages = Math.max(1, Math.ceil(matching / PAGE_SIZE));
  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (tab !== "open") sp.set("tab", tab);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `/admin/abandoned${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-purple-900">
            Abandoned checkouts
          </h1>
          <p className="mt-1 text-sm text-purple-900/60">
            Nudges send automatically 1 hour and 24 hours after a cart is left.
          </p>
        </div>
        <a
          href="/api/admin/abandoned/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
        >
          <Download className="h-4 w-4" /> Export
        </a>
      </div>

      {/* summary */}
      <div className="mb-5 flex flex-wrap items-stretch divide-x divide-purple-100 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        {[
          { label: "Not recovered", value: openCount.toString() },
          { label: "Recovered", value: recoveredCount.toString() },
          { label: "Recovery rate", value: `${rate}%` },
          { label: "Nudges sent", value: nudged.toString() },
        ].map((m) => (
          <div key={m.label} className="flex flex-1 flex-col justify-center px-5 py-4">
            <span className="text-xs font-medium text-purple-900/50">{m.label}</span>
            <span className="mt-0.5 font-display text-lg font-semibold text-purple-900">
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b border-purple-100 px-4 pt-3">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.key === "open" ? "/admin/abandoned" : `/admin/abandoned?tab=${t.key}`}
              className={`rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-purple-600 text-purple-900"
                  : "text-purple-900/50 hover:text-purple-900"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="border-b border-purple-100 px-4 py-3">
          <AdminSearch
            placeholder="Search by name, email, phone or city"
            defaultValue={q}
            className="max-w-md"
            hidden={tab !== "open" ? { tab } : undefined}
          />
        </div>

        {carts.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-purple-900/50">
            {tab === "open" ? "No open abandoned checkouts. 🎉" : "Nothing here."}
          </div>
        ) : (
          <ul className="divide-y divide-purple-50">
            {carts.map((c) => {
              let items: Item[] = [];
              try {
                items = JSON.parse(c.itemsJson);
              } catch {
                items = [];
              }
              const state = recoveryState(c);
              const badAddress = !LOOKS_LIKE_EMAIL.test(c.email);

              return (
                <li key={c.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-purple-900">{c.name || "Guest"}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TONES[state.tone]}`}
                        >
                          {state.label}
                        </span>
                        <span className="font-mono text-xs text-purple-900/35">
                          #{c.id.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-purple-900/60">
                        <a
                          href={badAddress ? undefined : `mailto:${c.email}`}
                          className={`flex items-center gap-1.5 ${
                            badAddress ? "text-rose-600" : "hover:text-purple-900"
                          }`}
                        >
                          {badAddress ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <Mail className="h-3.5 w-3.5" />
                          )}
                          {c.email}
                        </a>
                        {c.phone && <span>{c.phone}</span>}
                        <span>{c.city || "Pakistan"}</span>
                        <span>{formatDate(c.createdAt)}</span>
                        {c.recoveryEmailSentAt && (
                          <span className="text-purple-900/45">
                            last nudge {formatDate(c.recoveryEmailSentAt)}
                          </span>
                        )}
                      </div>

                      {badAddress && (
                        <p className="mt-1.5 text-xs text-rose-600">
                          Captured before the address was finished typing, so it can&apos;t be
                          emailed. Safe to delete.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-semibold text-purple-900">
                        {formatPKR(c.subtotal)}
                      </span>

                      {c.phone && !c.recovered && (
                        <a
                          href={waRecoveryLink(c, items, settings.storeName, siteUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Nudge on WhatsApp"
                          aria-label="Nudge on WhatsApp"
                          className="grid h-8 w-8 place-items-center rounded-lg text-green-700 hover:bg-green-50"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}

                      {!badAddress && !c.recovered && (
                        <form action={sendRecoveryEmail.bind(null, c.id)}>
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-purple-50 hover:text-purple-700"
                            aria-label="Send recovery email now"
                            title="Send recovery email now"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>
                      )}

                      {!c.recovered && (
                        <form action={markRecovered.bind(null, c.id)}>
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-green-50 hover:text-green-700"
                            aria-label="Mark recovered"
                            title="Mark recovered"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </form>
                      )}

                      <form action={deleteAbandoned.bind(null, c.id)}>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {items.map((it, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-cream px-2.5 py-1 text-xs text-purple-900/60"
                        >
                          {it.title}
                          {it.variantTitle ? ` · ${it.variantTitle}` : ""} × {it.quantity}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-purple-100 px-4 py-3">
          <p className="text-xs text-purple-900/50">
            {matching === 0
              ? "None"
              : `${(current - 1) * PAGE_SIZE + 1}-${Math.min(current * PAGE_SIZE, matching)} of ${matching}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Link
                href={pageHref(current - 1)}
                aria-label="Previous page"
                className={`grid h-8 w-8 place-items-center rounded-lg border border-purple-200 text-purple-900/70 ${
                  current === 1 ? "pointer-events-none opacity-40" : "hover:bg-purple-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <span className="px-2 text-xs text-purple-900/60">
                {current} / {totalPages}
              </span>
              <Link
                href={pageHref(current + 1)}
                aria-label="Next page"
                className={`grid h-8 w-8 place-items-center rounded-lg border border-purple-200 text-purple-900/70 ${
                  current >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-purple-50"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
