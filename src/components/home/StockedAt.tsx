import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { getStockists } from "@/lib/stockists";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export async function StockedAt() {
  const [s, items] = await Promise.all([getSettings(), getStockists()]);
  if (items.length === 0) return null;

  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Where to buy"
          title={s.stockistHeading}
          description={s.stockistSubtext}
        />

        <RevealGroup
          stagger={0.06}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {items.map((r) => {
            const inner = r.logoUrl ? (
              <Image
                src={r.logoUrl}
                alt={r.name}
                width={150}
                height={64}
                className="max-h-14 w-auto object-contain"
              />
            ) : (
              <span
                className="text-center font-display text-lg font-bold leading-tight"
                style={{ color: r.color }}
              >
                {r.name}
              </span>
            );
            return (
              <RevealItem
                key={r.id}
                className="flex h-24 items-center justify-center rounded-[1.5rem] bg-white px-4 shadow-soft-sm ring-ink transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>

        <p className="mt-8 text-center text-xs text-purple-900/40">
          Stockists shown are select retail partners. Availability may vary by branch.
        </p>
      </div>
    </section>
  );
}
