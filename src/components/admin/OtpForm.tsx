"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ShieldCheck } from "lucide-react";
import { verifyLogin, resendCode, type VerifyState } from "@/app/admin/login/actions";

export function OtpForm({ email }: { email: string }) {
  const [state, formAction] = useActionState<VerifyState, FormData>(verifyLogin, {});
  const [resendState, resendAction] = useActionState<VerifyState, FormData>(
    resendCode,
    {},
  );

  // Mask the address a little: j***@gmail.com
  const masked = email.replace(/^(.).*(@.*)$/, "$1***$2");

  return (
    <div className="grid min-h-screen place-items-center gradient-purple px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-cream">
            <ShieldCheck className="h-7 w-7 text-green-300" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-cream">
            Check your email
          </h1>
          <p className="mt-1 text-sm text-cream/60">
            We sent a 6-digit code to {masked}
          </p>
        </div>

        <form action={formAction} className="space-y-4 rounded-2xl bg-cream p-6 shadow-2xl">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
              Verification code
            </span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              required
              placeholder="123456"
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-purple-900/80">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-200"
            />
            Trust this device for 30 days
          </label>

          {state.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          )}
          {resendState.notice && !state.error && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {resendState.notice}
            </p>
          )}
          {resendState.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {resendState.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <form action={resendAction}>
            <ResendButton />
          </form>
          <span className="text-cream/30">·</span>
          <a href="/admin/login" className="text-cream/70 hover:text-cream">
            Start over
          </a>
        </div>
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
      {pending ? "Verifying…" : "Verify & sign in"}
    </button>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-cream/70 underline-offset-2 hover:text-cream hover:underline disabled:opacity-50"
    >
      {pending ? "Sending…" : "Resend code"}
    </button>
  );
}
