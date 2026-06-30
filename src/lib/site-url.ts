/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL on the host (e.g. the live
 * domain) to override; falls back to the production domain. No trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com"
).replace(/\/$/, "");
