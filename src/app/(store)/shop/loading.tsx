import { PageBanner } from "@/components/store/PageBanner";

/** Skeleton shown while the filtered shop query resolves. */
export default function ShopLoading() {
  return (
    <>
      <PageBanner
        eyebrow="Shop"
        title="All Products"
        description="Natural food made with real ingredients, for the way you eat today."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* controls placeholder */}
          <div className="mb-8 h-24 animate-pulse rounded-2xl border border-purple-100 bg-white/70" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm"
              >
                <div className="aspect-square animate-pulse bg-purple-100/50" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-purple-100/70" />
                  <div className="h-3 w-full animate-pulse rounded bg-purple-100/50" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-purple-100/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
