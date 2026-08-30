const fallback = [
  "Natural & Pure",
  "No Artificial Flavours",
  "High Protein",
  "Whole Grains",
  "Fibre Rich",
  "Responsibly Sourced",
  "Made in Pakistan",
  "Since 1999",
];

/** Bold scrolling brand-values strip - a Shan-style statement band. */
export function ValueTicker({ values }: { values?: string[] }) {
  const list = values && values.length > 0 ? values : fallback;
  const loop = [...list, ...list];
  return (
    <div className="relative -mt-px overflow-hidden bg-purple-900 py-6">
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {loop.map((v, i) => {
          // stagger the bob per word so the running line undulates like a wave
          const delay = `${((i % list.length) * 0.16).toFixed(2)}s`;
          return (
            <div key={i} className="flex items-center">
              <span
                className="inline-block font-display text-xl font-medium text-cream/90 [animation:tickerwave_2.6s_ease-in-out_infinite] motion-reduce:animate-none sm:text-2xl"
                style={{ animationDelay: delay }}
              >
                {v}
              </span>
              <span
                className="mx-7 inline-block text-gold-400 [animation:tickerwave_2.6s_ease-in-out_infinite] motion-reduce:animate-none sm:mx-9"
                style={{ animationDelay: delay }}
              >
                ✦
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
