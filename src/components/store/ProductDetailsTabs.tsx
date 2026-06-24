"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface Props {
  description: string;
  ingredients?: string;
  allergens?: string[];
  nutrition?: { label: string; value: string }[];
  /** generic copy shown alongside the product's own description */
  storage?: string;
  delivery?: string;
}

export function ProductDetailsTabs({
  description,
  ingredients,
  allergens = [],
  nutrition = [],
  storage = "Store in a cool, dry place away from direct sunlight. Reseal the pack after opening to keep it fresh.",
  delivery = "We deliver across Pakistan in 2-5 working days. Free delivery on orders over Rs 7,000, with Cash on Delivery available. Not happy with your order? Our 30-day satisfaction promise has you covered.",
}: Props) {
  const hasNutrition = Boolean(ingredients || allergens.length || nutrition.length);
  const sections = [
    { key: "desc", title: "Description", body: description || "No description available." },
    ...(hasNutrition ? [{ key: "nutrition", title: "Nutrition & ingredients", body: "" }] : []),
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
                  {s.key === "nutrition" ? (
                    <div className="space-y-4 px-5 pb-5 text-sm text-purple-900/70">
                      {ingredients && (
                        <div>
                          <p className="mb-1 font-semibold text-purple-900">Ingredients</p>
                          <p className="leading-relaxed">{ingredients}</p>
                        </div>
                      )}
                      {allergens.length > 0 && (
                        <div>
                          <p className="mb-1.5 font-semibold text-purple-900">Allergens</p>
                          <div className="flex flex-wrap gap-1.5">
                            {allergens.map((a) => (
                              <span
                                key={a}
                                className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                              >
                                Contains {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {nutrition.length > 0 && (
                        <div>
                          <p className="mb-1.5 font-semibold text-purple-900">
                            Nutrition facts
                          </p>
                          <table className="w-full overflow-hidden rounded-lg border border-purple-100 text-sm">
                            <tbody>
                              {nutrition.map((row, i) => (
                                <tr
                                  key={i}
                                  className={i % 2 ? "bg-cream/40" : "bg-white"}
                                >
                                  <td className="px-4 py-2 text-purple-900/70">{row.label}</td>
                                  <td className="px-4 py-2 text-right font-medium text-purple-900">
                                    {row.value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-purple-900/70">
                      {paras.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
