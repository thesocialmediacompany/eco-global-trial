import "server-only";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendAdminOtp } from "@/lib/email";

/**
 * Email one-time codes for admin 2FA.
 *
 * The code is stored only as a bcrypt hash with a short expiry, and locks after
 * a handful of wrong guesses so a leaked password can't be brute-forced through
 * the second factor. Verifying or locking clears the stored code, so each code
 * is single-use.
 */

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** A uniformly-random 6-digit code, zero-padded (e.g. "042317"). */
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Generate a fresh code for a user, persist its hash, and email it. */
export async function issueOtp(user: { id: string; email: string; name: string }) {
  const code = generateOtp();
  const hash = await bcrypt.hash(code, 10);
  await prisma.staffUser.update({
    where: { id: user.id },
    data: {
      otpHash: hash,
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      otpAttempts: 0,
    },
  });
  // Best-effort: surface a delivery failure so the UI can tell the user rather
  // than leaving them staring at a code that never arrives.
  return sendAdminOtp(user.email, code, user.name);
}

type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "locked" | "invalid" };

/** Check a submitted code against the stored hash, enforcing expiry + attempts. */
export async function verifyOtp(userId: string, code: string): Promise<VerifyResult> {
  const user = await prisma.staffUser.findUnique({ where: { id: userId } });
  if (!user || !user.otpHash || !user.otpExpiresAt) {
    return { ok: false, reason: "expired" };
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    await clearOtp(userId);
    return { ok: false, reason: "expired" };
  }

  if (user.otpAttempts >= MAX_ATTEMPTS) {
    await clearOtp(userId);
    return { ok: false, reason: "locked" };
  }

  const match = await bcrypt.compare(code.trim(), user.otpHash);
  if (!match) {
    const attempts = user.otpAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      // Burn the code so the attacker must trigger a brand-new one (which the
      // real owner would see land in their inbox).
      await clearOtp(userId);
      return { ok: false, reason: "locked" };
    }
    await prisma.staffUser.update({
      where: { id: userId },
      data: { otpAttempts: attempts },
    });
    return { ok: false, reason: "invalid" };
  }

  await clearOtp(userId);
  return { ok: true };
}

async function clearOtp(userId: string) {
  await prisma.staffUser.update({
    where: { id: userId },
    data: { otpHash: null, otpExpiresAt: null, otpAttempts: 0 },
  });
}
