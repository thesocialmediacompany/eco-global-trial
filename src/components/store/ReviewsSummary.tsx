import { Star } from "lucide-react";

/** Rating average + 5-to-1 star distribution bars. Pure presentational. */
export function ReviewsSummary({
  average,
  count,
  ratings,
}: {
  average: number;
  count: number;
  ratings: number[]; // every approved review's star rating
}) {
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: ratings.filter((r) => r === star).length,
  }));

  return (
    <div className="grid gap-6 rounded-2xl border border-purple-100 bg-white p-6 sm:grid-cols-[auto_1fr] sm:items-center">
      {/* average */}
      <div className="text-center sm:pr-6">
        <div className="font-display text-5xl font-semibold text-purple-900">{average}</div>
        <div className="mt-1 flex justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(average) ? "fill-gold-400 text-gold-400" : "text-purple-200"
              }`}
            />
          ))}
        </div>
        <div className="mt-1 text-xs text-purple-900/55">
          {count} review{count === 1 ? "" : "s"}
        </div>
      </div>

      {/* distribution */}
      <div className="space-y-1.5 sm:border-l sm:border-purple-100 sm:pl-6">
        {dist.map(({ star, n }) => (
          <div key={star} className="flex items-center gap-2 text-xs text-purple-900/60">
            <span className="flex w-7 items-center gap-0.5">
              {star} <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-purple-100">
              <div
                className="h-full rounded-full bg-gold-400"
                style={{ width: count ? `${(n / count) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-6 text-right tabular-nums">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
