import Link from "next/link";
import { PackageOpen, Home, Tag, ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const POINTS = [
  {
    icon: PackageOpen,
    title: "The full range, in one place",
    body: "Over 120 products — far more than any single shelf carries. Find every flavour and size here.",
  },
  {
    icon: Home,
    title: "Doorstep Cash on Delivery",
    body: "Skip the trip. We deliver across Pakistan and you pay at your door — no card needed.",
  },
  {
    icon: Tag,
    title: "Online-only welcome offer",
    body: "New here? Use code WELCOME20 at checkout for 20% off your first order.",
  },
];

/**
 * Gives shoppers a reason to buy online rather than just grabbing one item off
 * a retail shelf. Sits right after the stockist strip to balance it out.
 */
export function WhyOrderOnline() {
  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-[2rem] border border-purple-100 bg-white p-8 shadow-sm sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <Reveal direction="right">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
                Why order online
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-purple-900 sm:text-4xl">
                Love it at the store? You&apos;ll love it at your door.
              </h2>
              <p className="mt-3 text-purple-900/65">
                Buying direct gets you the whole range, doorstep delivery, and an
                offer you won&apos;t find on the shelf.
              </p>
              <Link
                href="/shop"
                className="group mt-6 inline-flex items-center gap-2 rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream transition-all hover:gap-3"
              >
                Shop the full range
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>

            <RevealGroup stagger={0.1} className="grid gap-4 sm:grid-cols-3">
              {POINTS.map((p) => (
                <RevealItem
                  key={p.title}
                  className="rounded-2xl border border-purple-100 bg-cream/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl gradient-purple-green text-cream">
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
