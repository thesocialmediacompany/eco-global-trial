import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { sendPushToAll, pushConfigured } from "@/lib/push";

/** Fire a test notification to every subscribed device, so staff can confirm it works. */
export async function POST(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!pushConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Push isn't configured on the server (VAPID_PRIVATE_KEY missing)." },
      { status: 200 },
    );
  }

  const result = await sendPushToAll({
    title: "Eco Global Foods",
    body: "Test alert — notifications are working. 🌿",
    url: "/admin/orders",
    tag: "egf-test",
  });

  return NextResponse.json({ ok: true, ...result });
}
