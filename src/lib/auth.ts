import { SignJWT, jwtVerify } from "jose";

/**
 * Lightweight session auth for the admin. Edge-safe (jose only, no Node APIs)
 * so it can be used from both middleware and server actions.
 */

export const SESSION_COOKIE = "egf_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string; // staff user id
  email: string;
  name: string;
  role: string;
}

function secretKey() {
  const secret = process.env.AUTH_SECRET || "egf-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const sessionMaxAge = MAX_AGE_SECONDS;
