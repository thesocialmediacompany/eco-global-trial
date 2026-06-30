import "server-only";

/**
 * Pluggable shipping layer. Callers (admin order actions) talk to this
 * interface, not to any specific courier. ZoomCOD (https://zoomcod.com) is the
 * configured provider; its real REST API is documented at
 * portal.zoomcod.com (Zoom_COD_API_Documentation.pdf).
 *
 * Config (env, with EGF account defaults baked in so it works once the key is
 * set): ZOOMCOD_API_KEY (required for live), ZOOMCOD_API_BASE,
 * ZOOMCOD_CLIENT_CODE, ZOOMCOD_PROFILE_ID, ZOOMCOD_ORIGIN_CITY,
 * ZOOMCOD_PRODUCT, ZOOMCOD_SERVICE_TYPE.
 */

export interface ShipmentRequest {
  orderNumber: number;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string; // destination city — must match a ZoomCOD city name
  amount: number; // COD collection amount in PKR
  weightKg?: number;
  description?: string;
}

export interface ShipmentResult {
  courier: string;
  trackingNumber: string;
  status: "booked" | "failed";
  labelUrl?: string;
  thirdParty?: string;
  message?: string;
}

export interface ShippingProvider {
  id: string;
  name: string;
  bookShipment(req: ShipmentRequest): Promise<ShipmentResult>;
}

function zoomConfig() {
  return {
    apiKey: process.env.ZOOMCOD_API_KEY || "",
    base: (process.env.ZOOMCOD_API_BASE || "https://portal.zoomcod.com/API").replace(/\/$/, ""),
    clientCode: process.env.ZOOMCOD_CLIENT_CODE || "2253",
    profileId: process.env.ZOOMCOD_PROFILE_ID || "20543",
    origin: process.env.ZOOMCOD_ORIGIN_CITY || "LAHORE",
    product: process.env.ZOOMCOD_PRODUCT || "Overnight",
    serviceType: process.env.ZOOMCOD_SERVICE_TYPE || "Regular",
  };
}

export function zoomCodConfigured() {
  return Boolean(process.env.ZOOMCOD_API_KEY);
}

/** Non-secret ZoomCOD config for display in the admin (never exposes the key). */
export function zoomCodPublicConfig() {
  const c = zoomConfig();
  return {
    live: Boolean(c.apiKey),
    clientCode: c.clientCode,
    profileId: c.profileId,
    origin: c.origin,
    product: c.product,
    serviceType: c.serviceType,
    base: c.base,
  };
}

/** ZoomCOD courier adapter (real API). */
export const zoomCod: ShippingProvider = {
  id: "zoomcod",
  name: "ZoomCOD",
  async bookShipment(req) {
    const c = zoomConfig();

    // No key yet → deterministic placeholder so the workflow stays testable.
    if (!c.apiKey) {
      return {
        courier: "ZoomCOD",
        trackingNumber: "ZC-" + String(req.orderNumber).padStart(7, "0"),
        status: "booked",
        message: "Test mode (no ZOOMCOD_API_KEY set).",
      };
    }

    try {
      const res = await fetch(`${c.base}/CreateOrder.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_key: c.apiKey,
          client_code: c.clientCode,
          profile_id: c.profileId,
          product: c.product,
          service_type: c.serviceType,
          origin: c.origin,
          destination: (req.city || "").toUpperCase().trim(),
          receiver_name: req.customerName,
          receiver_phone: req.phone,
          receiver_email: req.email || "",
          receiver_address: req.address,
          weight: String(req.weightKg ?? 0.5),
          pieces: 1,
          collection_amount: String(req.amount),
          product_description: req.description || "Eco Global Foods order",
          special_instruction: "",
          order_id: req.orderNumber,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const tracking = data?.tracking_no || data?.thirdparty_tracking_no || "";
      if (res.ok && tracking) {
        return {
          courier: "ZoomCOD",
          trackingNumber: String(tracking),
          status: "booked",
          labelUrl: data?.invoice_link || "",
          thirdParty: data?.thirdparty_name || "",
          message: data?.message || "",
        };
      }
      return {
        courier: "ZoomCOD",
        trackingNumber: "",
        status: "failed",
        message: data?.message || data?.error || `Booking failed (HTTP ${res.status})`,
      };
    } catch (e) {
      return {
        courier: "ZoomCOD",
        trackingNumber: "",
        status: "failed",
        message: e instanceof Error ? e.message : "Network error",
      };
    }
  },
};

/** Cancel a ZoomCOD shipment by tracking number. */
export async function cancelZoomCodShipment(trackingNo: string): Promise<{ ok: boolean; message: string }> {
  const c = zoomConfig();
  if (!c.apiKey || !trackingNo) return { ok: false, message: "Not configured" };
  try {
    const url = `${c.base}/CancelOrder.php?auth_key=${encodeURIComponent(c.apiKey)}&tracking_no=${encodeURIComponent(trackingNo)}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json().catch(() => ({}));
    const ok = res.ok && (data?.response === 1 || data?.response === "1");
    return { ok, message: data?.message?.message || data?.message || (ok ? "Cancelled" : "Cancel failed") };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

/** Fetch the current ZoomCOD status for a tracking number. */
export async function zoomCodCurrentStatus(trackingNo: string): Promise<string> {
  const c = zoomConfig();
  if (!c.apiKey || !trackingNo) return "";
  try {
    const res = await fetch(`${c.base}/currentStatus.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracking_no: trackingNo }),
    });
    const data = await res.json().catch(() => ({}));
    return typeof data?.status === "string" ? data.status : "";
  } catch {
    return "";
  }
}

export const shippingProviders: ShippingProvider[] = [zoomCod];

export function getShippingProvider(id = "zoomcod") {
  return shippingProviders.find((p) => p.id === id) ?? zoomCod;
}
