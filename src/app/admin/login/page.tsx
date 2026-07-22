import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In - Eco Global Foods",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; expired?: string; locked?: string }>;
}) {
  const { from, expired, locked } = await searchParams;
  const notice = locked
    ? "Too many wrong codes. Please sign in again to get a new one."
    : expired
      ? "Your code expired. Please sign in again to get a new one."
      : undefined;
  return <LoginForm from={from ?? "/admin"} notice={notice} />;
}
