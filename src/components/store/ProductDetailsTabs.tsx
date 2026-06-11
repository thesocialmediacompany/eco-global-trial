"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface Props {
  description: string;
  /** generic copy shown alongside the product's own description */
  storage?: string;
  delivery?: string;
}

export function ProductDetailsTabs({
  description,
  storage = "Store in a cool, dry place away from direct sunlight. Reseal the pack after opening to keep it fresh.",
  delivery = "We deliver across Pakistan in 2-5 working days. Free delivery on orders over Rs 7,000, with Cash on Delivery available. Not happy with your order? Our 30-day satisfaction promise has you covered.",
}: Props) {
  const sections = [
    { key: "desc", title: "Description", body: description || "No description available." },
    { key: "storage", title: "Storage", body: storage },
    { key: "delivery", title: "Delivery & Returns", body: delivery },
  ];
  const [open, setOpen] = useState<string | null>("desc");

  return (
    <div className="divide-y divide-purple-100 rounded-2xl border border-purple-100 bg-white">
      {sections.map((s) => {
        const isOpen = open === s.key;
        const paras = s.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
        return (
          <div key={s.key}>
            <button
              onClick={() => setOpen(isOpen ? null : s.key)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display text-base font-semibold text-purple-900">
                {s.title}
              </span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-100 text-purple-700">
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-purple-900/70">
                    {paras.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
