"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  loginCustomer,
  registerCustomer,
  type AuthState,
} from "@/app/(store)/account/actions";

export function AccountAuth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginAction] = useActionState<AuthState, FormData>(loginCustomer, {});
  const [regState, regAction] = useActionState<AuthState, FormData>(registerCustomer, {});

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-purple-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex rounded-full bg-cream p-1">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            mode === "login" ? "gradient-purple-green text-cream" : "text-purple-900/60"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            mode === "register" ? "gradient-purple-green text-cream" : "text-purple-900/60"
          }`}
        >
          Create account
        </button>
      </div>

      {mode === "login" ? (
        <form action={loginAction} className="space-y-4">
          <Field label="Email" name="email" type="email" />
          <Field label="Password" name="password" type="password" />
          {loginState.error && <Error>{loginState.error}</Error>}
          <Submit>Sign in</Submit>
          <p className="text-center text-sm">
            <a href="/account/forgot" className="font-medium text-green-700 hover:underline">
              Forgot your password?
            </a>
          </p>
        </form>
      ) : (
        <form action={regAction} className="space-y-4">
          <Field label="Full name" name="name" />
          <Field label="Email" name="email" type="email" />
          <Field label="Password (min 6 characters)" name="password" type="password" />
          {regState.error && <Error>{regState.error}</Error>}
          <Submit>Create account</Submit>
        </form>
      )}
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
      />
    </label>
  );
}

function Error({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{children}</p>;
}

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full gradient-purple-green py-3 text-sm font-semibold text-cream transition hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
