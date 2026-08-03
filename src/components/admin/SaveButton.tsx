"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";

/**
 * Submit button for admin server-action forms that gives the operator real
 * feedback: "Saving…" while the action runs, then a transient "Saved ✓". Many
 * settings pages previously used a plain <button> with no feedback, so a
 * successful save looked like nothing happened ("can't save"). Drop this in
 * place of that button — it reads the enclosing <form>'s status via
 * useFormStatus, so no change to the server action is needed.
 */
export function SaveButton({
  children,
  className,
  savedLabel = "Saved",
}: {
  children: React.ReactNode;
  className?: string;
  savedLabel?: string;
}) {
  const { pending } = useFormStatus();
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    // Falling edge of `pending` (true → false) means the action finished.
    if (wasPending.current && !pending) {
      setJustSaved(true);
      const t = setTimeout(() => setJustSaved(false), 2500);
      wasPending.current = pending;
      return () => clearTimeout(t);
    }
    wasPending.current = pending;
  }, [pending]);

  // Behaviour utilities are always applied; `className` supplies the visual
  // look (colour/padding), defaulting to the standard admin primary button so
  // it can be dropped in with no className at all.
  const behaviour = "inline-flex items-center justify-center gap-2 transition disabled:opacity-70";
  const visual =
    className ?? "mt-4 rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream";

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${behaviour} ${visual}`}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : justSaved ? (
        <>
          <Check className="h-4 w-4" /> {savedLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
