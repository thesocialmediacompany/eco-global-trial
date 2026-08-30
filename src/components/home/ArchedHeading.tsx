/**
 * Alpino-style heading that curves along a gentle upward arc. Rendered as SVG
 * text on a path so it scales fluidly and stays a real (a11y) heading.
 */
export function ArchedHeading({
  text,
  className = "",
  tone = "dark",
}: {
  text: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  const id = `arch-${text.replace(/[^a-z0-9]/gi, "").slice(0, 10)}`;
  // size the font so the whole (uppercase) string fits along the ~960u arc
  const fontSize = Math.max(48, Math.min(108, Math.round(980 / (text.length * 0.62))));
  return (
    <div className={className}>
      <svg
        viewBox="0 0 1000 200"
        preserveAspectRatio="xMidYMid meet"
        className="w-full overflow-visible"
        role="img"
        aria-label={text}
      >
        <defs>
          {/* gentle rainbow arc: dips at the ends, lifts through the middle */}
          <path id={id} d="M10 180 Q500 66 990 180" fill="none" />
        </defs>
        <text
          className={`font-display font-bold uppercase ${
            tone === "dark" ? "fill-purple-700" : "fill-cream"
          }`}
          style={{ fontSize: `${fontSize}px`, letterSpacing: "-1px" }}
        >
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
