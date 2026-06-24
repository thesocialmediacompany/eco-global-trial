import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/auth";

/** Current admin session (or null). */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Guard owner-only admin pages; staff are sent back to the dashboard. */
export async function requireOwner(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session || session.role !== "owner") redirect("/admin");
  return session;
}
