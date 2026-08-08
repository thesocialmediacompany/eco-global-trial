import cityList from "@/data/zoomcod-cities.json";

/**
 * The courier (ZoomCOD) only books shipments to cities on its own list, so a
 * free-typed city like "122" or "lahore,punjab,pakistan" makes an order
 * impossible to fulfil. We validate against this snapshot of ZoomCOD's city
 * list (src/data/zoomcod-cities.json) at checkout, in the admin order editor,
 * and again before booking. Regenerate the JSON from GetCitiesList.php if the
 * courier adds new cities.
 */
export const DELIVERY_CITIES: string[] = cityList as string[];

const CITY_SET = new Set(DELIVERY_CITIES.map((c) => c.trim().toLowerCase()));

/** True if `city` exactly matches a courier-serviceable city (case-insensitive). */
export function isDeliveryCity(city: string): boolean {
  return CITY_SET.has((city ?? "").trim().toLowerCase());
}

/** Return the canonical spelling for a city, or null if it isn't serviceable. */
export function canonicalCity(city: string): string | null {
  const key = (city ?? "").trim().toLowerCase();
  return DELIVERY_CITIES.find((c) => c.trim().toLowerCase() === key) ?? null;
}

/**
 * Accepts Pakistani mobile numbers in the common shapes people type:
 *   03001234567 · 0300 1234567 · 0300-1234567 · +923001234567 · 923001234567
 * Rejects anything that isn't a real 11-digit mobile (e.g. a name like "Khalid"),
 * which the courier would reject at booking time.
 */
export function isValidPakPhone(phone: string): boolean {
  const digits = (phone ?? "").replace(/[\s-]/g, "");
  return /^(?:\+?92|0)3\d{9}$/.test(digits);
}
