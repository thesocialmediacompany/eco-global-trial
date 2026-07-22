"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  PENDING_COOKIE,
  TRUSTED_COOKIE,
  signSession,
  signPending,
  verifyPending,
  signTrusted,
  verifyTrusted,
  sessionMaxAge,
  pendingMaxAge,
  trustedMaxAge,
} from "@/lib/auth";
import { issueOtp, verifyOtp } from "@/lib/admin-otp";

export type LoginState = { error?: string };
export type VerifyState = { error?: string; notice?: string };

const secure = process.env.NODE_ENV === "production";
const baseCookie = { httpOnly: true, sameSite: "lax", secure, path: "/" } as const;

function safeFrom(from: string) {
  return from.startsWith("/admin") ? from : "/admin";
}

async function startSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...baseCookie, maxAge: sessionMaxAge });
  store.delete(PENDING_COOKIE);
}

/** Step 1: verify email + password, then require an emailed code (unless this
 * browser is already a trusted device). */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = safeFrom(String(formData.get("from") ?? "/admin"));

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await prisma.staffUser.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password." };

  // Trusted device → skip the second factor for this browser.
  const store = await cookies();
  const trustedFor = await verifyTrusted(store.get(TRUSTED_COOKIE)?.value);
  if (trustedFor === user.id) {
    await startSession(user);
    redirect(from);
  }

  // Otherwise email a one-time code and move to the verify step.
  const result = await issueOtp(user);
  if (!result.sent) {
    return {
      error:
        "We couldn't email your login code. The store's email may be misconfigured — please contact the owner.",
    };
  }

  const pending = await signPending({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    from,
    otpTo: result.to,
  });
  store.set(PENDING_COOKIE, pending, { ...baseCookie, maxAge: pendingMaxAge });
  redirect("/admin/login/verify");
}

/** Step 2: check the emailed code and, on success, start the real session. */
export async function verifyLogin(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const store = await cookies();
  const pending = await verifyPending(store.get(PENDING_COOKIE)?.value);
  if (!pending) {
    redirect("/admin/login");
  }

  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  const remember = String(formData.get("remember") ?? "") === "on";
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code from your email." };
  }

  const result = await verifyOtp(pending.sub, code);
  if (!result.ok) {
    if (result.reason === "expired") {
      redirect("/admin/login?expired=1");
    }
    if (result.reason === "locked") {
      store.delete(PENDING_COOKIE);
      redirect("/admin/login?locked=1");
    }
    return { error: "That code isn't right. Check your email and try again." };
  }

  await startSession({
    id: pending.sub,
    email: pending.email,
    name: pending.name,
    role: pending.role,
  });

  if (remember) {
    const trusted = await signTrusted(pending.sub);
    store.set(TRUSTED_COOKIE, trusted, { ...baseCookie, maxAge: trustedMaxAge });
  }

  redirect(safeFrom(pending.from));
}

/** Email a fresh code if the first didn't arrive. */
export async function resendCode(
  _prev: VerifyState,
  _formData: FormData,
): Promise<VerifyState> {
  const store = await cookies();
  const pending = await verifyPending(store.get(PENDING_COOKIE)?.value);
  if (!pending) redirect("/admin/login");

  const result = await issueOtp({
    id: pending.sub,
    email: pending.email,
    name: pending.name,
  });
  return result.sent
    ? { notice: "A new code is on its way." }
    : { error: "Couldn't resend the code. Contact the store owner." };
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
