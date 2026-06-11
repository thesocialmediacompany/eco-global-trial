"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_COOKIE,
  signCustomer,
  customerSessionMaxAge,
  verifyCustomer,
} from "@/lib/customer-auth";
import { sendPasswordReset } from "@/lib/email";

async function currentCustomerId(): Promise<string | null> {
  const store = await cookies();
  const session = await verifyCustomer(store.get(CUSTOMER_COOKIE)?.value);
  return session?.sub ?? null;
}

export type AuthState = { error?: string; ok?: boolean };

async function setSession(id: string, email: string, name: string) {
  const token = await signCustomer({ sub: id, email, name });
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: customerSessionMaxAge,
  });
}

export async function registerCustomer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 6) {
    return { error: "Enter your name, email and a password of at least 6 characters." };
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing && existing.passwordHash) {
    return { error: "An account with this email already exists. Please sign in." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = existing
    ? await prisma.customer.update({ where: { email }, data: { name, passwordHash } })
    : await prisma.customer.create({ data: { name, email, passwordHash } });

  await setSession(customer.id, customer.email, customer.name);
  redirect("/account");
}

export async function loginCustomer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.passwordHash) {
    return { error: "No account found for this email." };
  }
  const ok = await bcrypt.compare(password, customer.passwordHash);
  if (!ok) return { error: "Invalid email or password." };

  await setSession(customer.id, customer.email, customer.name);
  redirect("/account");
}

export async function logoutCustomer() {
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE);
  redirect("/account");
}

// ── Profile ────────────────────────────────────────────────────────
export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const id = await currentCustomerId();
  if (!id) return { error: "Please sign in." };
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  if (!name) return { error: "Name is required." };

  await prisma.customer.update({ where: { id }, data: { name, phone, city } });

  // refresh the session name
  const c = await prisma.customer.findUnique({ where: { id } });
  if (c) await setSession(c.id, c.email, c.name);
  revalidatePath("/account/profile");
  return {};
}

// ── Addresses ──────────────────────────────────────────────────────
export async function addAddress(formData: FormData) {
  const id = await currentCustomerId();
  if (!id) return;
  const isDefault = formData.get("isDefault") === "on";
  if (isDefault) {
    await prisma.address.updateMany({ where: { customerId: id }, data: { isDefault: false } });
  }
  await prisma.address.create({
    data: {
      customerId: id,
      label: String(formData.get("label") ?? "Home"),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      line: String(formData.get("line") ?? ""),
      city: String(formData.get("city") ?? ""),
      isDefault,
    },
  });
  revalidatePath("/account/addresses");
}

export async function deleteAddress(addressId: string) {
  const id = await currentCustomerId();
  if (!id) return;
  await prisma.address.deleteMany({ where: { id: addressId, customerId: id } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(addressId: string) {
  const id = await currentCustomerId();
  if (!id) return;
  await prisma.address.updateMany({ where: { customerId: id }, data: { isDefault: false } });
  await prisma.address.updateMany({ where: { id: addressId, customerId: id }, data: { isDefault: true } });
  revalidatePath("/account/addresses");
}

// ── Password reset ─────────────────────────────────────────────────
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const customer = await prisma.customer.findUnique({ where: { email } });
  // Always behave the same to avoid leaking which emails exist.
  if (customer && customer.passwordHash) {
    const token = randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.customer.update({
      where: { id: customer.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${base}/account/reset?token=${token}`;
    try {
      await sendPasswordReset(customer.email, resetUrl, customer.name);
    } catch (e) {
      console.error("password reset email failed:", e);
    }
  }
  return { ok: true };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const customer = await prisma.customer.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!customer) return { error: "This reset link is invalid or has expired." };

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash: await bcrypt.hash(password, 10),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  await setSession(customer.id, customer.email, customer.name);
  redirect("/account");
}
