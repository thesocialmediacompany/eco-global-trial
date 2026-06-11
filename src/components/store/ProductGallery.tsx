"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X } from "lucide-react";

interface Props {
  name: string;
  emoji: string;
  gradient: string;
  imageUrl?: string;
  images?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
}

export function ProductGallery({
  name,
  emoji,
  gradient,
  imageUrl,
  images = [],
  isNew,
  isBestseller,
}: Props) {
  const all = [imageUrl, ...images].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = all[active];

  return (
    <div>
      <div
        className={`group relative grid aspect-square place-items-center overflow-hidden rounded-[2rem] ${
          current ? "bg-white" : gradient
        }`}
      >
        <div className="absolute left-5 top-5 z-10 flex flex-col gap-2">
          {isNew && (
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-purple-800 shadow">
              New
            </span>
          )}
          {isBestseller && (
            <span className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-purple-950 shadow">
              Bestseller
            </span>
          )}
        </div>

        {current ? (
          <>
            <Image
              src={current}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <button
              onClick={() => setZoom(true)}
              aria-label="Zoom image"
              className="absolute bottom-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-purple-900 opacity-0 shadow transition group-hover:opacity-100"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </>
        ) : (
          <span className="text-[12rem] drop-shadow-2xl">{emoji}</span>
        )}
      </div>

      {all.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {all.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                i === active ? "border-purple-500" : "border-purple-100 hover:border-purple-300"
              }`}
            >
              <Image src={src} alt={`${name} ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {zoom && current && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-purple-950/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
          >
            <button
              onClick={() => setZoom(false)}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-cream hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-square w-full max-w-2xl overflow-hidden rounded-2xl bg-white"
            >
              <Image src={current} alt={name} fill sizes="90vw" className="object-contain" />
            </motion.div>
            {all.length > 1 && (
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" onClick={(e) => e.stopPropagation()}>
                {all.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    className={`relative h-12 w-12 overflow-hidden rounded-lg border-2 ${
                      i === active ? "border-cream" : "border-white/30"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
