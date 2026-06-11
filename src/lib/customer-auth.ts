import { SignJWT, jwtVerify } from "jose";

/** Storefront customer sessions (separate from the admin session). */

export const CUSTOMER_COOKIE = "egf_customer_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface CustomerSession {
  sub: string; // customer id
  email: string;
  name: string;
}

function key() {
  const secret = process.env.AUTH_SECRET || "egf-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function signCustomer(payload: CustomerSession) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export async function verifyCustomer(
  token: string | undefined,
): Promise<CustomerSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

export const customerSessionMaxAge = MAX_AGE;
