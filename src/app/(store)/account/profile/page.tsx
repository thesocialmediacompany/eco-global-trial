import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CUSTOMER_COOKIE, verifyCustomer } from "@/lib/customer-auth";
import { PageBanner } from "@/components/store/PageBanner";
import { AccountNav } from "@/components/store/AccountNav";
import { ProfileForm } from "@/components/store/ProfileForm";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const store = await cookies();
  const session = await verifyCustomer(store.get(CUSTOMER_COOKIE)?.value);
  if (!session) redirect("/account");
  const customer = await prisma.customer.findUnique({ where: { id: session.sub } });
  if (!customer) redirect("/account");

  return (
    <>
      <PageBanner emoji="👤" eyebrow="My Account" title="Your profile" />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <AccountNav />
          <ProfileForm
            defaults={{
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              city: customer.city,
            }}
          />
        </div>
      </section>
    </>
  );
}
