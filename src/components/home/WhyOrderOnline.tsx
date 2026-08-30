import Link from "next/link";
import { PackageOpen, Home, Tag, ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type { StoreSettings } from "@/lib/settings-defaults";

/**
 * Gives shoppers a reason to buy online rather than just grabbing one item off
 * a retail shelf. Sits right after the stockist strip to balance it out.
 */
export function WhyOrderOnline({ s }: { s: StoreSettings }) {
  const POINTS = [
    { icon: PackageOpen, title: s.whyOnlineP1Title, body: s.whyOnlineP1Body },
    { icon: Home, title: s.whyOnlineP2Title, body: s.whyOnlineP2Body },
    { icon: Tag, title: s.whyOnlineP3Title, body: s.whyOnlineP3Body },
  ];
  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-soft ring-ink sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <Reveal direction="right">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
                {s.whyOnlineEyebrow}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase text-purple-900 sm:text-4xl">
                {s.whyOnlineTitle}
              </h2>
              <p className="mt-3 text-purple-900/65">
                {s.whyOnlineBody}
              </p>
              <Link
                href="/shop"
                className="group mt-6 inline-flex items-center gap-2 rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream shadow-soft transition-all hover:-translate-y-0.5 hover:gap-3 hover:shadow-soft-lg"
              >
                Shop the full range
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>

            <RevealGroup stagger={0.1} className="grid gap-4 sm:grid-cols-3">
              {POINTS.map((p) => (
                <RevealItem
                  key={p.title}
                  className="rounded-[1.4rem] bg-cream/60 p-5 ring-ink transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-sm"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-[0.9rem] gradient-purple-green text-cream shadow-soft-sm">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-purple-900">{p.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-purple-900/60">{p.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
