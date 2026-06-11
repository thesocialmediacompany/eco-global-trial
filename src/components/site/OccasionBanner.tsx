"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * A dismissible occasion / opening sticker shown at the very top of the site
 * (e.g. "Eid Mubarak", "Grand opening"). Editable + toggleable from admin
 * Settings. Dismissal is remembered per message text so changing the message
 * re-shows it to everyone.
 */
export function OccasionBanner({
  enabled,
  text,
  emoji,
}: {
  enabled: boolean;
  text: string;
  emoji: string;
}) {
  const [show, setShow] = useState(false);
  const key = `egf-occasion-${text}`;

  useEffect(() => {
    if (!enabled || !text) return;
    try {
      if (!localStorage.getItem(key)) setShow(true);
    } catch {
      setShow(true);
    }
  }, [enabled, text, key]);

  if (!enabled || !text || !show) return null;

  return (
    <div className="relative bg-gold-400 text-purple-950">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2 text-center text-sm font-semibold">
        {emoji && <span aria-hidden>{emoji}</span>}
        <span>{text}</span>
      </div>
      <button
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(key, "1");
          } catch {
            /* ignore */
          }
        }}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-purple-950/70 hover:bg-purple-950/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
