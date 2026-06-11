import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/store/PageBanner";
import { ForgotForm } from "@/components/store/PasswordResetForms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <>
      <PageBanner emoji="🔑" eyebrow="Account" title="Forgot your password?" />
      <section className="py-16">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <ForgotForm />
          <p className="mt-6 text-center text-sm text-purple-900/55">
            Remembered it?{" "}
            <Link href="/account" className="font-medium text-green-700 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
