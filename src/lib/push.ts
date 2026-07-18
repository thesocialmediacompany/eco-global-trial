import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { VAPID_PUBLIC_KEY } from "@/lib/push-public";

/**
 * Web push for the admin PWA.
 *
 * Sends are best-effort and must never block or fail the thing that triggered
 * them (an order being placed). Dead subscriptions (410 Gone / 404) are pruned
 * so the table doesn't fill with stale devices.
 */

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@ecoglobalfoods.com";

let configured = false;
function ensureConfigured(): boolean {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) return false; // not set up yet — no-op rather than throw
  if (!configured) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, privateKey);
    configured = true;
  }
  return true;
}

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  /** where tapping the notification lands, e.g. /admin/orders/<id> */
  url?: string;
  tag?: string;
}

/** Send a notification to every subscribed admin device. */
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; pruned: number }> {
  if (!ensureConfigured()) return { sent: 0, pruned: 0 };

  let subs: { id: string; endpoint: string; p256dh: string; auth: string }[] = [];
  try {
    subs = await prisma.pushSubscription.findMany();
  } catch (err) {
    console.warn("[push] could not load subscriptions:", err instanceof Error ? err.message : err);
    return { sent: 0, pruned: 0 };
  }

  const body = JSON.stringify(payload);
  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) dead.push(s.id);
        else console.warn("[push] send failed:", err instanceof Error ? err.message : err);
      }
    }),
  );

  if (dead.length) {
    await prisma.pushSubscription
      .deleteMany({ where: { id: { in: dead } } })
      .catch(() => {});
  }

  return { sent, pruned: dead.length };
}
