import { getPageHero } from "@/lib/page-hero";
import { Reveal } from "@/components/motion/Reveal";
import { CoverSlider } from "@/components/store/CoverSlider";

interface Props {
  pageKey: string;
  eyebrow?: string;
  title: string;
  description?: string;
  emoji?: string;
}

/**
 * Page cover/banner. Reads the page's editable cover (admin) and renders either
 * an auto-sliding image carousel or a colour gradient behind the title block.
 * Falls back to the default brand gradient when nothing is configured.
 */
export async function PageCover({ pageKey, eyebrow, title, description, emoji }: Props) {
  const hero = await getPageHero(pageKey);
  const isSlider = hero?.mode === "slider";
  const gradientClass = hero?.gradient ?? "gradient-purple-green";
  const animated = hero?.animated && !isSlider;

  return (
    <section className="relative isolate overflow-hidden px-5 pb-16 pt-28 text-cream sm:pt-32 lg:px-8">
      {isSlider ? (
        <CoverSlider images={hero!.images} autoplayMs={hero!.autoplayMs} />
      ) : (
        <div
          aria-hidden
          className={`absolute inset-0 -z-10 ${gradientClass} ${animated ? "gradient-animated" : ""}`}
          style={
            animated
              ? ({ "--grad-anim-duration": `${hero!.gradientSpeed}s` } as React.CSSProperties)
              : undefined
          }
        >
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
        </div>
      )}

      <div className="relative mx-auto max-w-4xl text-center">
        {emoji && (
          <Reveal>
            <div className="mb-4 text-5xl drop-shadow">{emoji}</div>
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
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight drop-shadow-sm sm:text-6xl">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-cream/85 drop-shadow-sm">
              {description}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
