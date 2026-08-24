/**
 * Shopify-style order-cancellation reasons. Shared between the cancel dialog
 * (the dropdown) and the server action (validation), so both stay in sync.
 * Kept out of the "use server" actions file, which may only export async fns.
 */
export const CANCEL_REASONS: Record<string, string> = {
  customer: "Customer changed / cancelled order",
  unavailable: "Items unavailable",
  fraud: "Fraudulent order",
  declined: "Payment declined",
  other: "Other",
};
