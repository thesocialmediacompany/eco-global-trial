"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

/** Official-style WhatsApp glyph (inherits currentColor). */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.13-.28-.2-.57-.35z" />
      <path d="M12.05 2a9.94 9.94 0 0 0-8.6 14.93L2 22l5.2-1.4A9.94 9.94 0 1 0 12.05 2zm0 18.18c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.09.83.83-3.01-.2-.31a8.26 8.26 0 1 1 7.01 3.83z" />
    </svg>
  );
}

/** Build a wa.me link with an optional prefilled message. */
export function waLink(number: string, message?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function FloatingButtons({ whatsappNumber }: { whatsappNumber: string }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="grid h-11 w-11 place-items-center rounded-full bg-purple-800 text-cream shadow-lg shadow-purple-900/30 transition hover:bg-purple-700"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {whatsappNumber && (
        <motion.a
          href={waLink(whatsappNumber, "Hello Eco Global Foods! 🌿 I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.08 }}
          className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-900/30"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </motion.a>
      )}
    </div>
  );
}
