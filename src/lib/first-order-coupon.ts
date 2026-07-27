import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Single-use welcome coupons for first-time customers.
 *
 * Each first order mints its own unique code (so "one-time use" is enforced by
 * a per-code usageLimit of 1 rather than a shared code anyone could burn). The
 * code is emailed to the customer for their NEXT order.
 */

const FIRST_ORDER_PERCENT = 5;
const VALID_DAYS = 30;
// Unambiguous alphabet (no O/0, I/1) so codes are easy to read and type.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[randomInt(0, ALPHABET.length)];
  return `WELCOME5-${s}`;
}

export interface FirstOrderCoupon {
  code: string;
  percent: number;
  expiresAt: Date;
}

/** Create a fresh single-use 5%-off coupon; returns it, or null if it couldn't
 * be created (e.g. repeated code collisions or a DB error). Best-effort. */
export async function createFirstOrderCoupon(): Promise<FirstOrderCoupon | null> {
  const expiresAt = new Date(Date.now() + VALID_DAYS * 24 * 60 * 60 * 1000);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      await prisma.discount.create({
        data: {
          code,
          type: "percentage",
          value: FIRST_ORDER_PERCENT,
          minSubtotal: 0,
          usageLimit: 1,
          active: true,
          endsAt: expiresAt,
        },
      });
      return { code, percent: FIRST_ORDER_PERCENT, expiresAt };
    } catch {
      // Unique-code collision (or transient error) — try a different code.
    }
  }
  return null;
}
