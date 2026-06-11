import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  // payment
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  refunded: "bg-purple-100 text-purple-700",
  // fulfillment
  fulfilled: "bg-green-100 text-green-800",
  unfulfilled: "bg-amber-100 text-amber-800",
  cancelled: "bg-rose-100 text-rose-700",
  // product status
  active: "bg-green-100 text-green-800",
  draft: "bg-purple-100 text-purple-700",
  archived: "bg-zinc-200 text-zinc-600",
};

const labels: Record<string, string> = {
  cod: "Cash on Delivery",
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  card: "Card",
  bank: "Bank transfer",
};

export function StatusBadge({ status }: { status: string }) {
  const label = labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status] ?? "bg-zinc-100 text-zinc-600",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
