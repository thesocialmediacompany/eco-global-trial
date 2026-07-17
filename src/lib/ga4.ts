import { BetaAnalyticsDataClient } from "@google-analytics/data";

/**
 * Google Analytics 4 reporting.
 *
 * Every helper returns an empty/neutral value rather than throwing: analytics
 * is decoration on the admin pages, and a GA outage must never take a page
 * down with it. Callers use ga4Configured() to tell "not set up yet" apart
 * from "set up but the query failed", which need different messages.
 */

export function ga4Configured(): boolean {
  return Boolean(
    process.env.GA4_PROPERTY_ID &&
      process.env.GA4_CLIENT_EMAIL &&
      process.env.GA4_PRIVATE_KEY,
  );
}

/**
 * Built on first use, not at module scope: constructing the client reads the
 * credentials, so doing it at import time would throw while the module is
 * being evaluated, where no caller's try/catch can catch it, and take down
 * every page that imports this file.
 */
let cached: BetaAnalyticsDataClient | null = null;

function client(): BetaAnalyticsDataClient | null {
  if (!ga4Configured()) return null;
  if (!cached) {
    cached = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA4_CLIENT_EMAIL,
        // Amplify stores the PEM with escaped newlines; the API needs real ones.
        private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
  }
  return cached;
}

function property() {
  return `properties/${process.env.GA4_PROPERTY_ID}`;
}

function warn(fn: string, err: unknown) {
  console.warn(`[ga4] ${fn} failed:`, err instanceof Error ? err.message : err);
}

/**
 * These reports are awaited alongside the DB queries that actually matter, so
 * a slow or hanging Google API call would otherwise hold up the whole page.
 * Cap the wait and let the caller fall back to its empty state.
 */
const GA4_TIMEOUT_MS = 4000;

function withTimeout<T>(work: Promise<T>): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${GA4_TIMEOUT_MS}ms`)), GA4_TIMEOUT_MS),
    ),
  ]);
}

export interface GA4Overview {
  users: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export async function getGA4Overview(
  startDate = "30daysAgo",
  endDate = "today",
): Promise<GA4Overview | null> {
  const c = client();
  if (!c) return null;
  try {
    const [response] = await withTimeout(
      c.runReport({
        property: property(),
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "totalUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      }),
    );
    const row = response.rows?.[0]?.metricValues;
    return {
      users: parseInt(row?.[0]?.value ?? "0"),
      sessions: parseInt(row?.[1]?.value ?? "0"),
      pageViews: parseInt(row?.[2]?.value ?? "0"),
      avgSessionDuration: Math.round(parseFloat(row?.[3]?.value ?? "0")),
      // GA4 returns bounceRate as a 0-1 ratio.
      bounceRate: Math.round(parseFloat(row?.[4]?.value ?? "0") * 100),
    };
  } catch (err) {
    warn("getGA4Overview", err);
    return null;
  }
}

export async function getGA4TopPages(startDate = "30daysAgo", endDate = "today") {
  const c = client();
  if (!c) return [];
  try {
    const [response] = await withTimeout(
      c.runReport({
        property: property(),
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 5,
      }),
    );
    return (response.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "/",
      views: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }));
  } catch (err) {
    warn("getGA4TopPages", err);
    return [];
  }
}

export async function getGA4DeviceBreakdown(startDate = "30daysAgo", endDate = "today") {
  const c = client();
  if (!c) return [];
  try {
    const [response] = await withTimeout(
      c.runReport({
        property: property(),
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
      }),
    );
    return (response.rows ?? []).map((row) => ({
      device: row.dimensionValues?.[0]?.value ?? "unknown",
      sessions: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }));
  } catch (err) {
    warn("getGA4DeviceBreakdown", err);
    return [];
  }
}

export interface GA4Day {
  /** YYYY-MM-DD */
  date: string;
  sessions: number;
}

/**
 * Daily sessions across the window, zero-filled so the caller can render a bar
 * per day without worrying about days GA omits for having no traffic.
 */
export async function getGA4Timeseries(days = 14): Promise<GA4Day[]> {
  const c = client();
  if (!c) return [];
  try {
    const [response] = await withTimeout(
      c.runReport({
        property: property(),
        dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
    );

    // GA4 returns YYYYMMDD; index them so missing days become zeroes.
    const found = new Map<string, number>();
    for (const row of response.rows ?? []) {
      const raw = row.dimensionValues?.[0]?.value ?? "";
      if (raw.length !== 8) continue;
      const iso = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      found.set(iso, parseInt(row.metricValues?.[0]?.value ?? "0"));
    }

    const out: GA4Day[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push({ date: iso, sessions: found.get(iso) ?? 0 });
    }
    return out;
  } catch (err) {
    warn("getGA4Timeseries", err);
    return [];
  }
}
