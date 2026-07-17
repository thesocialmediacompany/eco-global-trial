import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { sendDailyOrderSummary } from "@/lib/email";

/**
 * Emails the previous day's order summary to staff. Called once a day by the
 * GitHub Actions workflow in .github/workflows/daily-summary.yml (Amplify has
 * no cron). Same shared-secret guard as the abandoned-recovery cron; refuses
 * to run without CRON_SECRET rather than defaulting open.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!presented) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDailyOrderSummary();
  console.log(`[daily-summary] sent=${result.sent} reason=${"reason" in result ? result.reason : "-"}`);

  // A missing recipient is a config gap, not a failure the cron should red-flag
  // on every run; only a genuine send error is a failure.
  if (!result.sent && "reason" in result && result.reason !== "no notify recipient configured") {
    return NextResponse.json({ ok: false, ...result }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ...result });
}
