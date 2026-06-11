"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Counts up to `value` once the element scrolls into view. `prefix`/`suffix`
 * wrap the number (e.g. suffix "+" or "%"). Respects reduced motion by
 * snapping straight to the final value.
 */
export function CountUp({
  value,
  duration = 1.4,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Backstop: guarantee the final value lands even if rAF is throttled
    // (e.g. a background tab) so a user never sees a stuck "0".
    const settle = setTimeout(() => setDisplay(value), duration * 1000 + 250);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
