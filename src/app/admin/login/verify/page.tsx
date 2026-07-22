import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PENDING_COOKIE, verifyPending } from "@/lib/auth";
import { OtpForm } from "@/components/admin/OtpForm";

export const metadata: Metadata = {
  title: "Verify sign in - Eco Global Foods",
  robots: { index: false, follow: false },
};

export default async function VerifyPage() {
  // No valid half-authenticated token → they haven't passed the password step
  // (or it expired). Send them back to start over.
  const store = await cookies();
  const pending = await verifyPending(store.get(PENDING_COOKIE)?.value);
  if (!pending) redirect("/admin/login");

  return <OtpForm email={pending.email} />;
}
