/**
 * ZoomCOD Courier API wrapper
 * Docs: https://portal.zoomcod.com/API/
 *
 * Required env vars:
 *   ZOOMCOD_API_KEY      — your auth_key
 *   ZOOMCOD_CLIENT_CODE  — your client_code (e.g. "1001")
 *   ZOOMCOD_PROFILE_ID   — your shipper profile_id (e.g. "20045")
 *   ZOOMCOD_ORIGIN       — your dispatch city in UPPERCASE (e.g. "LAHORE")
 *
 * Product & service_type are auto-selected by weight:
 *   < 8 kg  → Overnight / Regular
 *   >= 8 kg → Overland  / Overland
 */

const BASE = "https://portal.zoomcod.com/API";

function authKey() {
  const key = process.env.ZOOMCOD_API_KEY;
  if (!key) throw new Error("ZOOMCOD_API_KEY is not set");
  return key;
}

// ─── Weight-based selectors ───────────────────────────────────────────────────

function getProductForWeight(weightKg: number): string {
  return weightKg < 8 ? "Overnight" : "Overland";
}

function getServiceTypeForWeight(weightKg: number): string {
  return weightKg < 8 ? "Regular" : "Overland";
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Input shape expected by actions.ts */
export interface ZoomCODOrderInput {
  orderNumber: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  weightKg?: number;
}

/** Return shape read by actions.ts (snake_case to match API response keys) */
export interface ZoomCODOrderResult {
  tracking_no: string;
  invoice_url: string;
  product: string;
  thirdparty_tracking_no: string;
  thirdparty_name: string;
  id: number;
  message: string;
}

// ─── Create Order ─────────────────────────────────────────────────────────────

export async function createZoomCODOrder(
  input: ZoomCODOrderInput
): Promise<ZoomCODOrderResult> {
  const weightKg = input.weightKg ?? 0;
  const product = getProductForWeight(weightKg);
  const service_type = getServiceTypeForWeight(weightKg);

  console.log(`ZoomCOD ENV check — client: '${process.env.ZOOMCOD_CLIENT_CODE}', profile: '${process.env.ZOOMCOD_PROFILE_ID}', origin: '${process.env.ZOOMCOD_ORIGIN}'`);
  console.log(`ZoomCOD product selected: ${product} (weightKg=${weightKg})`);

  const payload = {
    auth_key: authKey(),
    client_code: process.env.ZOOMCOD_CLIENT_CODE ?? "",
    profile_id: process.env.ZOOMCOD_PROFILE_ID ?? "",
    product,
    service_type,
    origin: process.env.ZOOMCOD_ORIGIN ?? "LAHORE",
    destination: input.city.toUpperCase(),
    receiver_name: input.customerName,
    receiver_phone: input.phone,
    receiver_email: "",
    receiver_address: input.address,
    weight: String(weightKg),
    pieces: 1,
    collection_amount: String(input.total),
    product_description: `Order #${input.orderNumber}`,
    special_instruction: "",
    order_id: input.orderNumber,
  };

  const res = await fetch(`${BASE}/CreateOrder.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`ZoomCOD CreateOrder HTTP ${res.status}`);
  }

  const raw = await res.text();
  console.log("ZoomCOD raw response:", raw);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`ZoomCOD returned non-JSON: ${raw}`);
  }

  if (!data.tracking_no) {
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : "ZoomCOD returned no tracking_no"
    );
  }

  return {
    tracking_no: data.tracking_no as string,
    invoice_url: (data.invoice_link as string) ?? "",
    product,
    thirdparty_tracking_no: (data.thirdparty_tracking_no as string) ?? (data.tracking_no as string),
    thirdparty_name: (data.thirdparty_name as string) ?? "ZoomCOD",
    id: data.id as number,
    message: (data.message as string) ?? "",
  };
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────

export async function cancelZoomCODOrder(trackingNo: string): Promise<string> {
  const url = new URL(`${BASE}/CancelOrder.php`);
  url.searchParams.set("auth_key", authKey());
  url.searchParams.set("tracking_no", trackingNo);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`ZoomCOD CancelOrder HTTP ${res.status}`);

  const data = await res.json();
  return data.message?.message ?? "Cancelled";
}

// ─── Current Status ───────────────────────────────────────────────────────────

export async function getZoomCODStatus(trackingNo: string): Promise<string> {
  const res = await fetch(`${BASE}/currentStatus.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tracking_no: trackingNo }),
  });
  if (!res.ok) throw new Error(`ZoomCOD currentStatus HTTP ${res.status}`);

  const data = await res.json();
  return data.status ?? "";
}

// ─── Track History ────────────────────────────────────────────────────────────

export interface ZoomCODTrackEvent {
  trackingNo: string;
  status: string;
  created: string;
}

export async function getZoomCODHistory(
  trackingNo: string
): Promise<ZoomCODTrackEvent[]> {
  const res = await fetch(`${BASE}/TrackOrder.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tracking_no: trackingNo }),
  });
  if (!res.ok) throw new Error(`ZoomCOD TrackOrder HTTP ${res.status}`);

  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((e: Record<string, string>) => ({
    trackingNo: e.tracking_no,
    status: e.status,
    created: e.created,
  }));
}

// ─── Cities List ──────────────────────────────────────────────────────────────

export interface ZoomCODCity {
  id: string;
  name: string;
}

export async function getZoomCODCities(): Promise<ZoomCODCity[]> {
  const res = await fetch(`${BASE}/GetCitiesList.php`, { method: "GET" });
  if (!res.ok) throw new Error(`ZoomCOD GetCitiesList HTTP ${res.status}`);

  const data = await res.json();
  return (data.data ?? []).map((c: Record<string, string>) => ({
    id: c.id,
    name: c.city_name,
  }));
}