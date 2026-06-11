"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  if (sent) {
    return (
      <div className="grid place-items-center rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-green-100">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-purple-900">
          Message sent!
        </h3>
        <p className="mt-1 text-sm text-purple-900/60">
          Thanks for reaching out. Our team will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-4 rounded-2xl border border-purple-100 bg-white p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *">
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Email *">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={input}
          />
        </Field>
      </div>
      <Field label="Subject">
        <input
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          className={input}
        />
      </Field>
      <Field label="Message *">
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={input}
        />
      </Field>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full gradient-purple-green px-7 py-3 text-sm font-semibold text-cream transition hover:opacity-95"
      >
        Send message <Send className="h-4 w-4" />
      </button>
    </form>
  );
}

const input =
  "w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      {children}
    </label>
  );
}
