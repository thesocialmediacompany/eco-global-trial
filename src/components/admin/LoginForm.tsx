"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Leaf } from "lucide-react";
import { login, type LoginState } from "@/app/admin/login/actions";

export function LoginForm({ from, notice }: { from: string; notice?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="grid min-h-screen place-items-center gradient-purple px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-cream">
            <Leaf className="h-7 w-7 text-green-300" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-cream">
            Eco Global Foods
          </h1>
          <p className="text-sm text-cream/60">Admin sign in</p>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-2xl bg-cream p-6 shadow-2xl"
        >
          <input type="hidden" name="from" value={from} />
          {notice && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {notice}
            </p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@ecoglobalfoods.com"
              className={input}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={input}
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg gradient-purple-green py-3 text-sm font-semibold text-cream transition hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

const input =
  "w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
