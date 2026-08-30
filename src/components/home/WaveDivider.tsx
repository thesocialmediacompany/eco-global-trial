/**
 * Signature Alpino-style wavy section divider. Drop it inside a `relative`
 * section; it sits flush against the chosen edge and is filled with the colour
 * of the *adjacent* section so one section appears to curve into the next.
 *
 * `fillClass` is a text-colour utility (currentColor drives the fill), e.g.
 * "text-cream" to blend into the cream page, "text-purple-950" for the dark
 * kitchen band.
 */
export function WaveDivider({
  edge = "bottom",
  fillClass = "text-cream",
  className = "",
}: {
  edge?: "top" | "bottom";
  fillClass?: string;
  className?: string;
}) {
  const isTop = edge === "top";
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 z-10 h-10 w-full sm:h-16 ${
        isTop ? "top-0" : "bottom-0"
      } ${fillClass} ${className}`}
      fill="currentColor"
    >
      {/* the same flowing wave as the hero: crest left, trough right */}
      <path
        d={
          isTop
            ? "M0 72C300 106 520 106 780 54 1040 2 1240 2 1440 28V0H0Z"
            : "M0 48C300 14 520 14 780 66 1040 118 1240 118 1440 92V120H0Z"
        }
      />
    </svg>
  );
}
