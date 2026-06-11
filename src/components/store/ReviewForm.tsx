"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Star, Check } from "lucide-react";
import type { ReviewState } from "@/app/(store)/product/actions";

type Action = (prev: ReviewState, formData: FormData) => Promise<ReviewState>;

export function ReviewForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState<ReviewState, FormData>(action, {});
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <p className="mt-3 font-medium text-purple-900">Thanks for your review!</p>
        <p className="text-sm text-purple-900/60">
          It will appear once our team approves it.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-purple-100 bg-white p-6">
      <h3 className="font-display text-lg font-semibold text-purple-900">Write a review</h3>
      <input type="hidden" name="rating" value={rating} />

      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} stars`}
            >
              <Star
                className={`h-6 w-6 transition ${
                  n <= (hover || rating) ? "fill-gold-400 text-gold-400" : "text-purple-200"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name *" className={input} />
        <input name="email" type="email" placeholder="Email (optional)" className={input} />
      </div>
      <input name="title" placeholder="Review title" className={`${input} mt-3`} />
      <textarea name="body" required rows={4} placeholder="Share your experience *" className={`${input} mt-3`} />

      {state.error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 rounded-full gradient-purple-green px-7 py-3 text-sm font-semibold text-cream transition hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "Submitting…" : "Submit review"}
    </button>
  );
}

const input =
  "w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
