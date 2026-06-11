"use client";

import { useActionState } from "react";
import { Send, Check } from "lucide-react";
import {
  subscribeNewsletter,
  type NewsletterState,
} from "@/app/(store)/newsletter/actions";

/**
 * Newsletter signup form, wired to the real subscribe action. `variant`
 * controls styling: "hero" (light text on the gradient card) or "footer"
 * (dark surface). `source` is stored so we know where a subscriber came from.
 */
export function NewsletterForm({
  variant = "hero",
  source = "home",
}: {
  variant?: "hero" | "footer";
  source?: string;
}) {
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(
    subscribeNewsletter,
    {},
  );

  const isFooter = variant === "footer";

  if (state.ok) {
    return (
      <p
        className={`inline-flex items-center gap-2 text-sm font-medium ${
          isFooter ? "text-green-300" : "text-cream"
        }`}
      >
        <Check className="h-4 w-4" /> You&apos;re subscribed. Thank you!
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className={
        isFooter
          ? "flex flex-col gap-2 sm:flex-row"
          : "mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
      }
    >
      <input type="hidden" name="source" value={source} />
      {/* honeypot for bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className={
          isFooter
            ? "flex-1 rounded-full border border-cream/15 bg-white/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-cream/40"
            : "flex-1 rounded-full border border-cream/20 bg-white/10 px-5 py-3.5 text-sm text-cream placeholder:text-cream/50 outline-none backdrop-blur transition focus:border-cream/50 focus:bg-white/15"
        }
      />
      <button
        type="submit"
        disabled={pending}
        className={
          isFooter
            ? "inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-green-400 disabled:opacity-60"
            : "inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-semibold text-purple-900 transition-all hover:bg-white disabled:opacity-60"
        }
      >
        {pending ? "Joining…" : "Subscribe"} <Send className="h-4 w-4" />
      </button>
      {state.error && (
        <p
          className={`mt-1 w-full text-xs ${isFooter ? "text-rose-300" : "text-rose-200"}`}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
