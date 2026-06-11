import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { paymentMethods, type PaymentMethodId } from "@/lib/payments";
import { getSettings, settingBool } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

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

  return <CheckoutForm methods={methods.length ? methods : paymentMethods} />;
}
