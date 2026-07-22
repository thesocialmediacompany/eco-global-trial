import { SignJWT, jwtVerify } from "jose";

/**
 * Lightweight session auth for the admin. Edge-safe (jose only, no Node APIs)
 * so it can be used from both middleware and server actions.
 */

export const SESSION_COOKIE = "egf_admin_session";
// Set after password + OTP succeed, while the browser awaits the emailed code.
export const PENDING_COOKIE = "egf_admin_2fa_pending";
// Set when a user ticks "trust this device" so future logins skip the code.
export const TRUSTED_COOKIE = "egf_admin_trusted";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const PENDING_MAX_AGE = 60 * 10; // 10 min — long enough to fetch the emailed code
const TRUSTED_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string; // staff user id
  email: string;
  name: string;
  role: string;
}

/** A half-authenticated login: password is verified, OTP is not yet. Carries
 * the intended destination so the redirect survives the second step. */
export interface PendingPayload extends SessionPayload {
  from: string;
}

function secretKey() {
  const secret = process.env.AUTH_SECRET || "egf-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload, kind: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    // Reject the half-authenticated pending token and the trusted-device token
    // so neither can be replayed as a full admin session. Tokens minted before
    // this field existed have no `kind` and are still accepted as sessions.
    if (payload.kind === "pending" || payload.kind === "trusted") return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Sign the half-authenticated token issued between the password and OTP steps. */
export async function signPending(payload: PendingPayload) {
  return new SignJWT({ ...payload, kind: "pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifyPending(token: string | undefined): Promise<PendingPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "pending") return null;
    return payload as unknown as PendingPayload;
  } catch {
    return null;
  }
}

/** Sign a 30-day token proving this browser already cleared OTP for a user. */
export async function signTrusted(userId: string) {
  return new SignJWT({ sub: userId, kind: "trusted" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TRUSTED_MAX_AGE}s`)
    .sign(secretKey());
}

/** Returns the user id this device is trusted for, or null. */
export async function verifyTrusted(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.kind !== "trusted" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export const sessionMaxAge = MAX_AGE_SECONDS;
export const pendingMaxAge = PENDING_MAX_AGE;
export const trustedMaxAge = TRUSTED_MAX_AGE;
