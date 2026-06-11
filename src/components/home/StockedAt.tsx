import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { retailers } from "@/data/retailers";
import { getSettings } from "@/lib/settings";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const LOGO_EXTS = ["svg", "png", "webp", "jpg", "jpeg"];

/** Resolve an official logo file for a retailer if one was dropped in public/stores. */
function findLogo(slug: string): string | null {
  for (const ext of LOGO_EXTS) {
    const rel = `/stores/${slug}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return rel;
  }
  return null;
}

export async function StockedAt() {
  const s = await getSettings();
  const items = retailers.map((r) => ({ ...r, logo: findLogo(r.slug) }));

  return (
    <section className="relative border-y border-purple-100/60 bg-cream/40 py-10 sm:py-14">
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
          {items.map((r) => (
            <RevealItem
              key={r.slug}
              className="flex h-24 items-center justify-center rounded-2xl border border-purple-100 bg-white px-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
            >
              {r.logo ? (
                <Image
                  src={r.logo}
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
              )}
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mt-8 text-center text-xs text-purple-900/40">
          Stockists shown are select retail partners. Availability may vary by branch.
        </p>
      </div>
    </section>
  );
}
