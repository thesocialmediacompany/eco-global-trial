const values = [
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
export function ValueTicker() {
  const loop = [...values, ...values];
  return (
    <div className="relative -mt-px overflow-hidden border-y border-purple-100 bg-purple-900 py-5">
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {loop.map((v, i) => (
          <div key={i} className="flex items-center">
            <span className="font-display text-xl font-medium text-cream/90 sm:text-2xl">
              {v}
            </span>
            <span className="mx-7 text-gold-400 sm:mx-9">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
