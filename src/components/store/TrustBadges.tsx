import { ShieldCheck, Truck, RotateCcw, BadgeCheck, Award } from "lucide-react";

const BADGES = [
  { icon: BadgeCheck, label: "100% Halal", sub: "Certified" },
  { icon: Truck, label: "Cash on Delivery", sub: "Pay at your door" },
  { icon: RotateCcw, label: "Easy Returns", sub: "30-day promise" },
  { icon: Award, label: "ISO & HACCP", sub: "Food-safety certified" },
  { icon: ShieldCheck, label: "Since 1999", sub: "Trusted in Pakistan" },
];

/**
 * Trust signals shown at the point of decision (product buy box + checkout).
 * In a COD market these reassurances do more for conversion than anything else.
 * `variant` "full" = product page grid, "compact" = checkout strip.
 */
export function TrustBadges({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-purple-900/70">
        {BADGES.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5">
            <b.icon className="h-3.5 w-3.5 text-green-600" />
            {b.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 border-t border-purple-100 pt-6 sm:grid-cols-3">
      {BADGES.map((b) => (
        <div
          key={b.label}
          className="flex items-start gap-2.5 rounded-xl border border-purple-100 bg-white/60 p-3"
        >
          <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-purple-900">{b.label}</span>
            <span className="text-[0.7rem] text-purple-900/55">{b.sub}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
