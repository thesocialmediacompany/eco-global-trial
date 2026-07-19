import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { sendPushToOne } from "@/lib/push";

/** Store a browser's push subscription so it can receive admin alerts. */
export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Incomplete subscription" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh, auth, label: session.name ?? "" },
    create: { endpoint, p256dh, auth, label: session.name ?? "" },
  });

  // Confirm the whole chain the moment alerts are switched on: ping just this
  // device. welcomeSent is false when the server has no VAPID key, which the UI
  // surfaces so enabling alerts is never a silent dead end.
  const welcomeSent = await sendPushToOne(
    { endpoint, p256dh, auth },
    {
      title: "Order alerts are on",
      body: "You'll get a ping here for every new order. 🌿",
      url: "/admin/orders",
      tag: "egf-welcome",
    },
  );

  return NextResponse.json({ ok: true, welcomeSent });
}
