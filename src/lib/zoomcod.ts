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

export interface ZoomCODOrderInput {
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  receiverAddress: string;
  destination: string;       // city name in UPPERCASE e.g. "KARACHI"
  collectionAmount: number;  // COD amount in PKR
  productDescription: string;
  weightKg?: number;
  pieces?: number;
  specialInstruction?: string;
  orderId: number;           // your internal order number
}

export interface ZoomCODOrderResult {
  trackingNo: string;
  thirdPartyTrackingNo: string;
  thirdPartyName: string;
  id: number;
  message: string;
  invoiceLink: string;
}

// ─── Create Order ─────────────────────────────────────────────────────────────

export async function createZoomCODOrder(
  input: ZoomCODOrderInput
): Promise<ZoomCODOrderResult> {
  const weightKg = input.weightKg ?? 0.5;

  const payload = {
    auth_key: authKey(),
    client_code: process.env.ZOOMCOD_CLIENT_CODE ?? "",
    profile_id: process.env.ZOOMCOD_PROFILE_ID ?? "",
    product: getProductForWeight(weightKg),
    service_type: getServiceTypeForWeight(weightKg),
    origin: process.env.ZOOMCOD_ORIGIN ?? "LAHORE",
    destination: input.destination.toUpperCase(),
    receiver_name: input.receiverName,
    receiver_phone: input.receiverPhone,
    receiver_email: input.receiverEmail ?? "",
    receiver_address: input.receiverAddress,
    weight: String(weightKg),
    pieces: input.pieces ?? 1,
    collection_amount: String(input.collectionAmount),
    product_description: input.productDescription,
    special_instruction: input.specialInstruction ?? "",
    order_id: input.orderId,
  };

  const res = await fetch(`${BASE}/CreateOrder.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`ZoomCOD CreateOrder HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.tracking_no) {
    throw new Error(data.message ?? "ZoomCOD returned no tracking_no");
  }

  return {
    trackingNo: data.tracking_no,
    thirdPartyTrackingNo: data.thirdparty_tracking_no ?? data.tracking_no,
    thirdPartyName: data.thirdparty_name ?? "ZoomCOD",
    id: data.id,
    message: data.message,
    invoiceLink: data.invoice_link ?? "",
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