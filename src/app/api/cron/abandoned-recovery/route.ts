import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { runAbandonedRecoverySweep } from "@/lib/abandoned-recovery";

/**
 * Sends whichever abandoned-cart nudges are due. Called on a schedule by the
 * GitHub Actions workflow in .github/workflows/abandoned-recovery.yml, because
 * Amplify hosting has no cron of its own.
 *
 * Sits outside /admin, so the admin middleware does not cover it: it carries
 * its own shared-secret check. Without CRON_SECRET set it refuses to run
 * rather than defaulting open, since anything that can reach this URL can mail
 * our customers.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!presented) return false;

  // Compare in constant time so the response time can't be used to guess the
  // secret a character at a time. Buffers must match in length to compare.
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const result = await runAbandonedRecoverySweep();

  // Logged so a failing sweep is diagnosable from CloudWatch, not just from
  // whatever the caller happened to keep.
  console.log(
    `[abandoned-recovery] considered=${result.considered} sent=${result.sent} failed=${result.failed} skipped=${result.skipped} in ${Date.now() - started}ms`,
  );
  for (const line of result.details) console.log(`[abandoned-recovery]   ${line}`);

  return NextResponse.json({ ok: true, ...result });
}
