/**
 * Brand-purple area + line trend chart for the admin dashboard.
 *
 * The SVG is stretched full-bleed (preserveAspectRatio="none") so it fills any
 * width; the stroke stays crisp via non-scaling-stroke, and the axis labels +
 * hover dots are HTML overlays so they never distort. Server-renderable — the
 * only interactivity is native title tooltips on the dots.
 */
export function TrendChart({
  id,
  values,
  labels,
  format,
  className = "h-40",
  color = "#5e3052", // purple-600
}: {
  id: string;
  values: number[];
  labels: string[];
  format: (n: number) => string;
  className?: string;
  color?: string;
}) {
  const W = 720;
  const H = 240;
  const padY = 8;
  const max = Math.max(1, ...values);
  const n = values.length;
  const xAt = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const yAt = (v: number) => padY + (1 - v / max) * (H - 2 * padY);
  const line = values.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  const gradId = `trend-${id}`;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Gridlines + value labels (undistorted HTML overlay). */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        {[max, max / 2, 0].map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-right text-[0.65rem] tabular-nums text-purple-900/40">
              {format(v)}
            </span>
            <div className="h-px flex-1 bg-purple-100" />
          </div>
        ))}
      </div>
      {/* Chart + hover dots, inset past the label gutter. */}
      <div className="absolute inset-y-0 left-14 right-0">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#${gradId})`} />
          <polyline
            points={line}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Round hover dots with a native tooltip (bars used to have these). */}
        {values.map((v, i) => (
          <div
            key={i}
            title={`${labels[i]}: ${format(v)}`}
            className="group absolute flex h-5 w-5 -translate-x-1/2 translate-y-1/2 items-center justify-center"
            style={{ left: `${n <= 1 ? 50 : (i / (n - 1)) * 100}%`, bottom: `${(1 - yAt(v) / H) * 100}%` }}
          >
            <span
              className="block h-2 w-2 rounded-full opacity-0 ring-2 ring-white transition group-hover:opacity-100"
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
