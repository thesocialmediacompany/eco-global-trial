/**
 * Pluggable payment layer for Pakistan.
 *
 * Each method declares how an order's payment is initiated. COD is fully
 * functional (collected on delivery → starts "pending"). The wallet/card
 * gateways are structured stubs: they expose the same interface and currently
 * mark the order "pending" until real merchant credentials + redirect/callback
 * flows are wired in (JazzCash, Easypaisa, and a card acquirer).
 */

export type PaymentMethodId = "cod" | "jazzcash" | "easypaisa" | "card" | "bank";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
  /** emoji/icon hint shown in the UI */
  icon: string;
  /** whether the customer needs to do something off-site (gateway redirect) */
  requiresRedirect: boolean;
  /** extra copy shown when selected (e.g. bank account details) */
  instructions?: string;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
    icon: "💵",
    requiresRedirect: false,
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    description: "Pay securely with your JazzCash mobile wallet.",
    icon: "📱",
    requiresRedirect: true,
  },
  {
    id: "easypaisa",
    label: "Easypaisa",
    description: "Pay securely with your Easypaisa account.",
    icon: "📲",
    requiresRedirect: true,
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    description: "Visa, Mastercard or local cards via secure gateway.",
    icon: "💳",
    requiresRedirect: true,
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Transfer to our account and upload your receipt.",
    icon: "🏦",
    requiresRedirect: false,
    instructions:
      "Account Title: Eco Global Foods (SMC-PVT) Ltd. · Bank: Meezan Bank · IBAN: PK00MEZN0000000000000000. Send your receipt to support@ecoglobalfoods.com with your order number.",
  },
];

export function getPaymentMethod(id: string) {
  return paymentMethods.find((m) => m.id === id);
}

/**
 * The payment status an order should start with for a given method.
 * COD/bank → pending (manual reconciliation). Gateways → pending until the
 * real callback confirms payment.
 */
export function initialPaymentStatus(_methodId: PaymentMethodId): "pending" | "paid" {
  return "pending";
}
