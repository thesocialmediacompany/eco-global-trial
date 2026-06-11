import "server-only";
import type { PaymentMethodId } from "@/lib/payments";

/**
 * Payment GATEWAY integration layer (server-only). This is where the real
 * JazzCash / Easypaisa / card redirect flows plug in. The storefront checkout
 * creates the order first (status "pending"), then - for redirect methods -  * calls `initiatePayment()` and sends the customer to the returned URL. The
 * gateway later calls back to /api/payments/[provider]/callback which marks the
 * order paid.
 *
 * Each provider currently returns `{ kind: "manual" }` until credentials are set
 * in the environment (see .env.example) and the TODO blocks below are completed.
 */

export interface PaymentInitiation {
  /** "manual" = no redirect (COD, bank transfer, or gateway not yet configured) */
  kind: "manual" | "redirect";
  url?: string;
}

interface InitiateArgs {
  method: PaymentMethodId;
  orderNumber: number;
  amount: number; // PKR
  email: string;
  phone: string;
}

function configured(...keys: string[]) {
  return keys.every((k) => !!process.env[k]);
}

export async function initiatePayment(args: InitiateArgs): Promise<PaymentInitiation> {
  switch (args.method) {
    case "jazzcash": {
      if (!configured("JAZZCASH_MERCHANT_ID", "JAZZCASH_PASSWORD", "JAZZCASH_INTEGRITY_SALT")) {
        return { kind: "manual" };
      }
      // TODO(JazzCash): build the pp_* params, compute the HMAC-SHA256 secure
      // hash with JAZZCASH_INTEGRITY_SALT, and POST/redirect to the JazzCash
      // hosted checkout. Return { kind: "redirect", url }.
      return { kind: "manual" };
    }
    case "easypaisa": {
      if (!configured("EASYPAISA_STORE_ID", "EASYPAISA_HASH_KEY")) {
        return { kind: "manual" };
      }
      // TODO(Easypaisa): create the transaction, sign with EASYPAISA_HASH_KEY,
      // and redirect to the Easypaisa payment page.
      return { kind: "manual" };
    }
    case "card": {
      if (!configured("CARD_GATEWAY_SECRET_KEY")) {
        return { kind: "manual" };
      }
      // TODO(Card): create a checkout session with your acquirer / Stripe and
      // return its hosted URL.
      return { kind: "manual" };
    }
    // COD and bank transfer never redirect.
    default:
      return { kind: "manual" };
  }
}

/**
 * Verify a gateway callback's authenticity. Implement the provider-specific
 * signature check (HMAC / webhook secret) before trusting it.
 */
export async function verifyCallback(
  provider: string,
  _payload: Record<string, string>,
): Promise<boolean> {
  switch (provider) {
    case "jazzcash":
      // TODO: recompute pp_SecureHash and compare.
      return false;
    case "easypaisa":
      // TODO: validate the response hash.
      return false;
    case "card":
      // TODO: verify the webhook signature with CARD_GATEWAY_WEBHOOK_SECRET.
      return false;
    default:
      return false;
  }
}
