import { Mail, Phone, Trash2, Check, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { deleteAbandoned, markRecovered, sendRecoveryEmail } from "./actions";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d);
}

type Item = { title: string; variantTitle?: string; quantity: number; price: number };

export default async function AbandonedPage() {
  const carts = await prisma.abandonedCheckout.findMany({
    where: { recovered: false },
    orderBy: { updatedAt: "desc" },
  });
  const recoveredCount = await prisma.abandonedCheckout.count({ where: { recovered: true } });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Abandoned carts</h1>
        <p className="mt-1 text-sm text-purple-900/60">
          {carts.length} open · {recoveredCount} recovered
        </p>
      </div>

      {carts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-purple-200 bg-white/60 py-16 text-center text-purple-900/50">
          No abandoned carts right now. 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((c) => {
            let items: Item[] = [];
            try {
              items = JSON.parse(c.itemsJson);
            } catch {
              items = [];
            }
            return (
              <div key={c.id} className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-purple-900">{c.name || "Guest"}</p>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-purple-900/60">
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-purple-900">
                        <Mail className="h-3.5 w-3.5" /> {c.email}
                      </a>
                      {c.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> {c.phone}
                        </span>
                      )}
                      <span>{formatDate(c.updatedAt)}</span>
                      {c.recoveryEmailSentAt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                          <Send className="h-3 w-3" /> Reminder sent
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold text-purple-900">
                      {formatPKR(c.subtotal)}
                    </span>
                    <form action={sendRecoveryEmail.bind(null, c.id)}>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-purple-50 hover:text-purple-700"
                        aria-label="Send recovery email"
                        title={c.recoveryEmailSentAt ? `Reminder sent ${formatDate(c.recoveryEmailSentAt)}` : "Send recovery email"}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                    <form action={markRecovered.bind(null, c.id)}>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-green-50 hover:text-green-700"
                        aria-label="Mark recovered"
                        title="Mark recovered"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                    <form action={deleteAbandoned.bind(null, c.id)}>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-purple-50 pt-3 text-xs text-purple-900/60">
                    {items.map((it, i) => (
                      <span key={i} className="rounded-full bg-cream px-2.5 py-1">
                        {it.title}
                        {it.variantTitle ? ` · ${it.variantTitle}` : ""} × {it.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
