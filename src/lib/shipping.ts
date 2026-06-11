import "server-only";

/**
 * Pluggable shipping layer. The storefront/admin talk to this interface, not to
 * any specific courier - so couriers can be swapped or added without touching
 * callers. ZoomCOD (https://zoomcod.com) is the configured provider; its real
 * API (booking, bulk, tracking sync) plugs into `bookShipment` later.
 */

export interface ShipmentRequest {
  orderNumber: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  amount: number; // COD amount in PKR
  weightKg?: number;
}

export interface ShipmentResult {
  courier: string;
  trackingNumber: string;
  status: "booked" | "failed";
}

export interface ShippingProvider {
  id: string;
  name: string;
  bookShipment(req: ShipmentRequest): Promise<ShipmentResult>;
}

/**
 * ZoomCOD adapter. Currently a structured stub that returns a deterministic
 * tracking number; replace the body of `bookShipment` with a fetch() to the
 * ZoomCOD booking API once credentials are provided.
 */
export const zoomCod: ShippingProvider = {
  id: "zoomcod",
  name: "ZoomCOD",
  async bookShipment(req) {
    const apiKey = process.env.ZOOMCOD_API_KEY;
    const apiBase = process.env.ZOOMCOD_API_BASE || "https://api.zoomcod.com";

    // When credentials are present, call the real ZoomCOD booking API.
    if (apiKey) {
      try {
        const res = await fetch(`${apiBase}/v1/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            // TODO: confirm exact field names against ZoomCOD's API docs.
            order_reference: req.orderNumber,
            consignee_name: req.customerName,
            consignee_phone: req.phone,
            consignee_address: req.address,
            consignee_city: req.city,
            cod_amount: req.amount,
            weight_kg: req.weightKg ?? 0.5,
            pickup_address_id: process.env.ZOOMCOD_PICKUP_ADDRESS_ID,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            courier: "ZoomCOD",
            trackingNumber: data.tracking_number ?? data.cn ?? String(req.orderNumber),
            status: "booked",
          };
        }
      } catch {
        /* fall through to local fallback below */
      }
      return { courier: "ZoomCOD", trackingNumber: "", status: "failed" };
    }

    // Not configured yet - deterministic placeholder so the workflow is testable.
    const trackingNumber = "ZC-" + String(req.orderNumber).padStart(7, "0");
    return { courier: "ZoomCOD", trackingNumber, status: "booked" };
  },
};

export const shippingProviders: ShippingProvider[] = [zoomCod];

export function getShippingProvider(id = "zoomcod") {
  return shippingProviders.find((p) => p.id === id) ?? zoomCod;
}
