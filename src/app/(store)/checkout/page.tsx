import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { paymentMethods, type PaymentMethodId } from "@/lib/payments";
import { getSettings, settingBool } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

// Always render fresh: payment methods and coupon availability come from live
// settings/DB, and checkout must never be served stale from the cache.
export const dynamic = "force-dynamic";

const toggleKey: Record<PaymentMethodId, "payCod" | "payJazzcash" | "payEasypaisa" | "payCard" | "payBank"> = {
  cod: "payCod",
  jazzcash: "payJazzcash",
  easypaisa: "payEasypaisa",
  card: "payCard",
  bank: "payBank",
};

export default async function CheckoutPage() {
  const s = await getSettings();
  const methods = paymentMethods.filter((m) => settingBool(s, toggleKey[m.id]));

  // Only offer the discount field when a coupon can actually be redeemed.
  const activeCoupons = await prisma.discount.count({ where: { active: true } });

  return (
    <CheckoutForm
      methods={methods.length ? methods : paymentMethods}
      couponsEnabled={activeCoupons > 0}
    />
  );
}
