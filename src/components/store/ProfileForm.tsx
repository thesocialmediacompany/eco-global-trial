"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { updateProfile, type AuthState } from "@/app/(store)/account/actions";

export function ProfileForm({
  defaults,
}: {
  defaults: { name: string; email: string; phone: string; city: string };
}) {
  const [state, action] = useActionState<AuthState, FormData>(updateProfile, {});

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-purple-100 bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input name="name" required defaultValue={defaults.name} className={input} />
        </Field>
        <Field label="Email (cannot change)">
          <input value={defaults.email} disabled className={`${input} opacity-60`} />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={defaults.phone} className={input} />
        </Field>
        <Field label="City">
          <input name="city" defaultValue={defaults.city} className={input} />
        </Field>
      </div>
      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <Save />
    </form>
  );
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
    >
      <Check className="h-4 w-4" /> {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      {children}
    </label>
  );
}

const input =
  "w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
