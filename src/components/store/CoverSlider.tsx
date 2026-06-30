"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/** Auto-sliding, crossfading background image carousel for a page cover. */
export function CoverSlider({
  images,
  autoplayMs = 5000,
}: {
  images: string[];
  autoplayMs?: number;
}) {
  const [i, setI] = useState(0);
  const n = images.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), Math.max(2000, autoplayMs));
    return () => clearInterval(t);
  }, [n, autoplayMs]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-purple-950">
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: 6, ease: "linear" } }}
          className="absolute inset-0"
        >
          <Image
            src={images[i]}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* legibility overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-purple-950/45 to-purple-950/75" />

      {/* dots */}
      {n > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-cream" : "w-1.5 bg-cream/50 hover:bg-cream/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
