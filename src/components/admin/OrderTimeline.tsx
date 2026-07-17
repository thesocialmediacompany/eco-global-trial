import {
  CheckCircle2,
  CreditCard,
  Mail,
  MessageSquare,
  Package,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
  Archive,
} from "lucide-react";
import type { TimelineEntry } from "@/lib/order-events";
import { groupByDay } from "@/lib/order-events";

const ICONS: Record<string, typeof Package> = {
  placed: ShoppingBag,
  paid: CreditCard,
  fulfilled: Package,
  delivered: CheckCircle2,
  courier: Truck,
  email: Mail,
  refund: RotateCcw,
  cancel: XCircle,
  archive: Archive,
  comment: MessageSquare,
};

function time(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function OrderTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-purple-900/45">
        Nothing recorded for this order yet.
      </p>
    );
  }

  const groups = groupByDay(entries);

  return (
    <div className="relative">
      {/* the spine the dots sit on */}
      <span
        aria-hidden
        className="absolute bottom-2 left-[7px] top-2 w-px bg-purple-100"
      />

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.day}>
            <p className="mb-3 pl-7 text-sm font-semibold text-purple-900/70">{g.day}</p>
            <ul className="space-y-3.5">
              {g.entries.map((e) => {
                const Icon = ICONS[e.kind] ?? MessageSquare;
                const isComment = e.kind === "comment";
                return (
                  <li key={e.id} className="relative flex items-start gap-3 pl-7">
                    <span className="absolute left-0 top-1 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-white bg-purple-300 ring-1 ring-purple-100" />
                    {isComment ? (
                      <div className="flex-1 rounded-xl border border-purple-100 bg-cream/50 px-3.5 py-2.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium text-purple-900">
                            {e.actor || "Staff"}
                          </span>
                          <span className="shrink-0 text-xs text-purple-900/45">
                            {time(e.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-purple-900/80">
                          {e.message}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-1 items-start justify-between gap-3">
                        <p className="flex items-start gap-2 text-sm text-purple-900/80">
                          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-900/35" />
                          <span>
                            {e.message}
                            {e.actor && (
                              <span className="text-purple-900/45"> · {e.actor}</span>
                            )}
                          </span>
                        </p>
                        <span className="shrink-0 text-xs text-purple-900/45">
                          {time(e.createdAt)}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
