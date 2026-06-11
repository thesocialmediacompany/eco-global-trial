import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MapPin, Trash2, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CUSTOMER_COOKIE, verifyCustomer } from "@/lib/customer-auth";
import { PageBanner } from "@/components/store/PageBanner";
import { AccountNav } from "@/components/store/AccountNav";
import { addAddress, deleteAddress, setDefaultAddress } from "../actions";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const store = await cookies();
  const session = await verifyCustomer(store.get(CUSTOMER_COOKIE)?.value);
  if (!session) redirect("/account");

  const addresses = await prisma.address.findMany({
    where: { customerId: session.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageBanner emoji="📍" eyebrow="My Account" title="Saved addresses" />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <AccountNav />

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* list */}
            <div className="space-y-3">
              {addresses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-purple-200 bg-white/60 py-12 text-center text-purple-900/55">
                  No saved addresses yet.
                </div>
              )}
              {addresses.map((a) => (
                <div key={a.id} className="rounded-2xl border border-purple-100 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-green-600" />
                      <div>
                        <p className="flex items-center gap-2 font-medium text-purple-900">
                          {a.label}
                          {a.isDefault && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-sm text-purple-900/70">
                          {a.name} · {a.phone}
                        </p>
                        <p className="text-sm text-purple-900/70">
                          {a.line}
                          {a.city && `, ${a.city}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!a.isDefault && (
                        <form action={setDefaultAddress.bind(null, a.id)}>
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-purple-50 hover:text-gold-500"
                            aria-label="Set as default"
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        </form>
                      )}
                      <form action={deleteAddress.bind(null, a.id)}>
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* add form */}
            <form action={addAddress} className="h-fit space-y-3 rounded-2xl border border-purple-100 bg-white p-5">
              <h2 className="font-display text-base font-semibold text-purple-900">Add address</h2>
              <input name="label" placeholder="Label (e.g. Home)" defaultValue="Home" className={input} />
              <input name="name" required placeholder="Full name *" className={input} />
              <input name="phone" placeholder="Phone" className={input} />
              <input name="line" required placeholder="Address *" className={input} />
              <input name="city" placeholder="City" className={input} />
              <label className="flex items-center gap-2 text-sm text-purple-900/80">
                <input type="checkbox" name="isDefault" className="h-4 w-4 accent-green-600" />
                Set as default
              </label>
              <button className="w-full rounded-full gradient-purple-green py-2.5 text-sm font-semibold text-cream">
                Save address
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

const input =
  "w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
