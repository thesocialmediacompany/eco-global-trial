"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import {
  requestPasswordReset,
  resetPassword,
  type AuthState,
} from "@/app/(store)/account/actions";

const input =
  "w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-full gradient-purple-green py-3 text-sm font-semibold text-cream disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState<AuthState, FormData>(requestPasswordReset, {});

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <p className="mt-3 font-medium text-purple-900">Check your inbox</p>
        <p className="text-sm text-purple-900/60">
          If an account exists for that email, we&apos;ve sent a reset link.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-purple-100 bg-white p-6 sm:p-8">
      <p className="text-sm text-purple-900/60">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <input name="email" type="email" required placeholder="you@example.com" className={input} />
      <Submit>Send reset link</Submit>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<AuthState, FormData>(resetPassword, {});
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-purple-100 bg-white p-6 sm:p-8">
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-purple-900/70">New password</span>
        <input name="password" type="password" required minLength={6} placeholder="At least 6 characters" className={input} />
      </label>
      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <Submit>Set new password</Submit>
    </form>
  );
}
