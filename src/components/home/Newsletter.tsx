"use client";

import { motion } from "framer-motion";
import { NewsletterForm } from "@/components/site/NewsletterForm";

export function Newsletter({
  heading,
  subtext,
  offerEnabled = true,
}: {
  heading: string;
  subtext: string;
  /** When false, drops the discount-offer framing and shows neutral copy. */
  offerEnabled?: boolean;
}) {
  const shownHeading = offerEnabled ? heading : "Join our newsletter";
  const shownSubtext = offerEnabled
    ? subtext
    : "Be the first to hear about new products, recipes and offers.";
  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] gradient-purple-green px-6 py-14 text-center text-cream shadow-2xl shadow-purple-900/30 sm:px-12"
        >
          <motion.div
            aria-hidden
            className="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-gold-400/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-4xl">🌿</span>
          <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-semibold sm:text-4xl">
            {shownHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream/80">{shownSubtext}</p>

          <NewsletterForm variant="hero" source="home" />

          <p className="mt-4 text-xs text-cream/55">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}
