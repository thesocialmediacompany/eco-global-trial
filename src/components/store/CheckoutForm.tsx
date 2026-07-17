"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR, formatWeight, LOOKS_LIKE_EMAIL } from "@/lib/utils";
import type { PaymentMethod, PaymentMethodId } from "@/lib/payments";
import { placeOrder } from "@/app/(store)/checkout/actions";
import { TrustBadges } from "@/components/store/TrustBadges";

interface Props {
  methods: PaymentMethod[];
}

export function CheckoutForm({ methods }: Props) {
  const router = useRouter();
  const { items, subtotal, totalWeight, shipping, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PaymentMethodId>(methods[0]?.id ?? "cod");
  const [discountCode, setDiscountCode] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    note: "",
  });

  const total = subtotal + shipping;

  /*
   * Capture the in-progress checkout so we can follow up if it's never placed.
   *
   * Requires a complete-looking address, not merely an "@": this fires while
   * the shopper is still typing, so "someone@gmai" would otherwise be saved as
   * its own cart. Those rows can never be emailed and never match the finished
   * order, so they sit in the abandoned list as permanent false leads.
   */
  const abandonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!LOOKS_LIKE_EMAIL.test(form.email.trim()) || items.length === 0) return;
    if (abandonTimer.current) clearTimeout(abandonTimer.current);
    abandonTimer.current = setTimeout(() => {
      fetch("/api/checkout/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name,
          phone: form.phone,
          city: form.city,
          subtotal,
          items: items.map((i) => ({ title: i.title, variantTitle: i.variantTitle, quantity: i.quantity, price: i.price })),
        }),
      }).catch(() => {});
    }, 1500);
    return () => {
      if (abandonTimer.current) clearTimeout(abandonTimer.current);
    };
  }, [form.email, form.name, form.phone, form.city, subtotal, items]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await placeOrder({
        items: items.map((i) => ({
          productId: i.productId,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
        })),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
        paymentMethod: method,
        discountCode: discountCode || undefined,
        note: form.note,
      });
      if (res.ok) {
        clear();
        router.push(`/order/${res.orderNumber}`);
      } else {
        setError(res.error);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto grid min-h-[50vh] max-w-2xl place-items-center px-5 pt-32 text-center">
        <div>
          <span className="text-6xl">🛒</span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-purple-900">
            Your cart is empty
          </h1>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full gradient-purple-green px-7 py-3.5 text-sm font-semibold text-cream"
          >
            <ShoppingBag className="h-4 w-4" /> Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-28 lg:grid-cols-[1fr_400px] lg:px-8"
    >
      {/* left: details */}
      <div className="space-y-8">
        <h1 className="font-display text-3xl font-semibold text-purple-900">Checkout</h1>

        {/* contact */}
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-purple-900">
            Contact & delivery
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name *" value={form.name} onChange={(v) => set("name", v)} required />
            <Input label="Phone *" value={form.phone} onChange={(v) => set("phone", v)} required type="tel" />
            <Input
              label="Email"
              value={form.email}
              onChange={(v) => set("email", v)}
              type="email"
              className="sm:col-span-2"
            />
            <Input
              label="Address *"
              value={form.address}
              onChange={(v) => set("address", v)}
              required
              className="sm:col-span-2"
            />
            <Input label="City *" value={form.city} onChange={(v) => set("city", v)} required />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-purple-900/70">
              Order note (optional)
            </label>
            <textarea
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </section>

        {/* payment */}
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold text-purple-900">
            Payment method
          </h2>
          <div className="space-y-2.5">
            {methods.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  method === m.id
                    ? "border-purple-500 bg-purple-50/60 ring-1 ring-purple-200"
                    : "border-purple-200 bg-white hover:border-purple-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                  className="mt-1 h-4 w-4 accent-purple-600"
                />
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-medium text-purple-900">
                    <span>{m.icon}</span> {m.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-purple-900/60">
                    {m.description}
                  </span>
                  {method === m.id && m.instructions && (
                    <span className="mt-2 block rounded-lg bg-cream p-3 text-xs text-purple-900/70">
                      {m.instructions}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* right: summary */}
      <div className="h-fit rounded-2xl border border-purple-100 bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold text-purple-900">Your order</h2>
        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <div key={`${it.productId}-${it.variantTitle}`} className="flex items-center gap-3">
              <span
                className={`relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg text-xl ${
                  it.imageUrl ? "bg-white" : it.gradient
                }`}
              >
                {it.imageUrl ? (
                  <Image src={it.imageUrl} alt={it.title} fill sizes="48px" className="object-cover" />
                ) : (
                  it.emoji
                )}
                <span className="absolute -right-1.5 -top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-purple-700 text-[0.65rem] font-bold text-cream">
                  {it.quantity}
                </span>
              </span>
              <div className="flex-1 text-sm">
                <p className="font-medium leading-tight text-purple-900">{it.title}</p>
                {it.variantTitle && (
                  <p className="text-xs text-purple-900/50">{it.variantTitle}</p>
                )}
              </div>
              <span className="text-sm font-medium text-purple-900">
                {formatPKR(it.price * it.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* discount */}
        <div className="mt-5 flex gap-2">
          <input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Discount code"
            className="flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm uppercase text-purple-900 outline-none focus:border-purple-400"
          />
        </div>
        <p className="mt-1 text-[0.7rem] text-purple-900/40">
          Try WELCOME20, FREESHIP or EGF500. Applied at checkout.
        </p>

        <div className="mt-5 space-y-2 border-t border-purple-100 pt-4 text-sm">
          <div className="flex justify-between text-purple-900/70">
            <span>Subtotal</span>
            <span className="text-purple-900">{formatPKR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-purple-900/70">
            <span>
              Shipping
              {totalWeight > 0 && (
                <span className="ml-1 text-xs text-purple-900/40">
                  ({formatWeight(totalWeight)})
                </span>
              )}
            </span>
            <span className="text-purple-900">
              {shipping === 0 ? "Free" : formatPKR(shipping)}
            </span>
          </div>
          <div className="flex justify-between border-t border-purple-100 pt-2 font-display text-lg font-semibold text-purple-900">
            <span>Total</span>
            <span>{formatPKR(total)}</span>
          </div>
          <p className="text-[0.7rem] text-purple-900/40">
            Discounts are validated and applied on the next step.
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full gradient-purple-green py-3.5 text-sm font-semibold text-cream transition hover:opacity-95 disabled:opacity-60"
        >
          <Lock className="h-4 w-4" />
          {pending ? "Placing order…" : `Place order · ${formatPKR(total)}`}
        </button>
        <p className="mt-3 text-center text-xs text-purple-900/40">
          Secure checkout · Your details are protected
        </p>

        <div className="mt-4 border-t border-purple-100 pt-4">
          <TrustBadges variant="compact" />
        </div>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
      />
    </label>
  );
}
