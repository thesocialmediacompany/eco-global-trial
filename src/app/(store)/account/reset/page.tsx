import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/store/PageBanner";
import { ResetForm } from "@/components/store/PasswordResetForms";

export const metadata: Metadata = { title: "Set new password", robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <PageBanner emoji="🔒" eyebrow="Account" title="Set a new password" />
      <section className="py-16">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          {token ? (
            <ResetForm token={token} />
          ) : (
            <div className="rounded-2xl border border-purple-100 bg-white p-6 text-center">
              <p className="text-purple-900/70">This reset link is missing its token.</p>
              <Link href="/account/forgot" className="mt-3 inline-block font-medium text-green-700 hover:underline">
                Request a new link
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
