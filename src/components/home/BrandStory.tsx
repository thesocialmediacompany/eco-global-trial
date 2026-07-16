"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import type { StoreSettings } from "@/lib/settings-defaults";

export function BrandStory({ s }: { s: StoreSettings }) {
  const pillars = [
    { value: s.brandStoryStat1Value, label: s.brandStoryStat1Label },
    { value: s.brandStoryStat2Value, label: s.brandStoryStat2Label },
    { value: s.brandStoryStat3Value, label: s.brandStoryStat3Label },
  ];
  return (
    <section id="story" className="relative overflow-hidden py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Visual panel */}
        <Reveal direction="right">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] gradient-purple-green p-1 shadow-2xl shadow-purple-900/20">
            <div className="relative grid h-full w-full place-items-center rounded-[1.8rem] bg-purple-950/20">
              <motion.div
                className="text-[8rem]"
                animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                🌿
              </motion.div>
              {/* floating mini tokens */}
              {[
                { e: "🥣", c: "left-8 top-10", d: 0 },
                { e: "🍫", c: "right-10 top-14", d: 1 },
                { e: "🥛", c: "left-14 bottom-12", d: 0.5 },
                { e: "🌾", c: "right-12 bottom-10", d: 1.4 },
              ].map((t) => (
                <motion.span
                  key={t.e}
                  className={`absolute text-4xl ${t.c}`}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5 + t.d, repeat: Infinity, ease: "easeInOut", delay: t.d }}
                >
                  {t.e}
                </motion.span>
              ))}
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-cream/95 px-5 py-2 font-display text-sm font-semibold text-purple-900 shadow-lg">
                Eco Global Foods (SMC-PVT) Ltd.
              </span>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div>
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-green-600">
              {s.brandStoryEyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-purple-900 sm:text-5xl">
              {s.brandStoryTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-base text-purple-900/70 sm:text-lg">
              {s.brandStoryBody}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-purple-100 pt-8">
            {pillars.map((p, i) => (
              <Reveal key={p.value} delay={0.15 + i * 0.08}>
                <div>
                  <div className="font-display text-2xl font-semibold text-purple-800 sm:text-3xl">
                    {p.value}
                  </div>
                  <div className="mt-1 text-xs text-purple-900/55 sm:text-sm">
                    {p.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
