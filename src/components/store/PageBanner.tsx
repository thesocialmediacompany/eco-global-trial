import { Reveal } from "@/components/motion/Reveal";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  emoji?: string;
}

/** Premium gradient banner used at the top of inner storefront pages. */
export function PageBanner({ eyebrow, title, description, emoji }: Props) {
  return (
    <section className="relative isolate overflow-hidden gradient-purple-green px-5 pb-16 pt-28 text-cream sm:pt-32 lg:px-8">
      <div
        aria-hidden
        className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-green-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl text-center">
        {emoji && (
          <Reveal>
            <div className="mb-4 text-5xl">{emoji}</div>
          </Reveal>
        )}
        {eyebrow && (
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-gold-300">
              {eyebrow}
            </span>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-cream/80">
              {description}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
