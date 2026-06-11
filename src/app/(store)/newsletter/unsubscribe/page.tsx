import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let ok = false;

  if (token) {
    const sub = await prisma.newsletterSubscriber.findFirst({ where: { unsubToken: token } });
    if (sub) {
      if (sub.active) {
        await prisma.newsletterSubscriber.update({
          where: { id: sub.id },
          data: { active: false },
        });
      }
      ok = true;
    }
  }

  return (
    <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-5 py-24 text-center">
      <div>
        {ok ? (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold text-purple-900">
              You&apos;re unsubscribed
            </h1>
            <p className="mt-3 text-purple-900/60">
              You won&apos;t receive any more newsletters from us. Changed your mind?
              You can re-subscribe anytime from the footer of our site.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-100">
              <XCircle className="h-8 w-8 text-rose-600" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold text-purple-900">
              Link not valid
            </h1>
            <p className="mt-3 text-purple-900/60">
              This unsubscribe link is invalid or has already been used. If you keep
              receiving emails, please contact us.
            </p>
          </>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream"
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-purple-200 px-6 py-3 text-sm font-semibold text-purple-900 hover:bg-purple-50"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
