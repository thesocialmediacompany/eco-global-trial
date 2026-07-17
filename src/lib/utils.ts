import { clsx, type ClassValue } from "clsx";

/** Tailwind-friendly className combiner. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * A complete-looking address: something, an @, a domain, a dot, a suffix.
 * Deliberately not a full RFC 5322 check, which accepts addresses no real
 * mailbox uses. The point is to reject half-typed input like "me@gmai" from
 * code that watches a field as the user types.
 */
export const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Format a number as Pakistani Rupees. */
export function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a weight in grams as a friendly "850 g" / "1.2 kg" label. */
export function formatWeight(grams: number) {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(kg < 10 ? 1 : 0)} kg`;
  }
  return `${Math.round(grams)} g`;
}
