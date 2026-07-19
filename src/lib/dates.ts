/**
 * Date formatting, always in Pakistan time.
 *
 * Every timestamp is stored as a UTC instant, and the server this runs on
 * (AWS Lambda) has its clock in UTC. An Intl formatter with no `timeZone`
 * uses the runtime's zone, so dates rendered on the server came out five hours
 * early — an order placed at 10:25 pm Karachi displayed as 5:25 pm.
 *
 * That's invisible on a developer machine already set to Asia/Karachi, which is
 * exactly how it reached production. Formatting lives here, with the zone
 * pinned, so no call site can silently reintroduce it.
 */

export const STORE_TIME_ZONE = "Asia/Karachi";

function fmt(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-PK", { timeZone: STORE_TIME_ZONE, ...options });
}

/** 19 Jul, 10:25 pm — lists where the day and time both matter. */
export function formatDateTime(d: Date) {
  return fmt({ day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(d);
}

/** 19 Jul 2026 — dates where the time is noise. */
export function formatDate(d: Date) {
  return fmt({ day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** 19 July 2026 at 10:25 pm — a record's headline timestamp. */
export function formatLongDateTime(d: Date) {
  return fmt({
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/** 19 July 2026 — long form, no time (articles, policies). */
export function formatLongDate(d: Date) {
  return fmt({ day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** 10:25 pm — time alone, for entries already grouped under a day. */
export function formatTime(d: Date) {
  return fmt({ hour: "numeric", minute: "2-digit" }).format(d);
}

/** 19 Jul — compact axis and chart labels. */
export function formatDayMonth(d: Date) {
  return fmt({ day: "numeric", month: "short" }).format(d);
}

/** 19 July — day headings in a timeline. */
export function formatDayMonthLong(d: Date) {
  return fmt({ day: "numeric", month: "long" }).format(d);
}

/**
 * The Pakistan calendar day (YYYY-MM-DD) a moment falls on. Used for bucketing
 * by day — `toISOString().slice(0,10)` would bucket by the UTC day and push
 * everything after 7pm Karachi into tomorrow.
 */
export function pktDayKey(d: Date) {
  // en-CA renders as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TIME_ZONE }).format(d);
}
