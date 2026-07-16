"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, UploadCloud } from "lucide-react";
import { migrateBatch } from "@/app/admin/(panel)/tools/migrate-images/actions";

export function ImageMigrator({ initialRemaining }: { initialRemaining: number }) {
  const [remaining, setRemaining] = useState(initialRemaining);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(initialRemaining === 0);
  const [failedCount, setFailedCount] = useState(0);
  const [error, setError] = useState("");

  const start = initialRemaining;
  const doneCount = start - remaining;
  const pct = start ? Math.round((doneCount / start) * 100) : 100;

  async function run() {
    setRunning(true);
    setError("");
    let skip: string[] = [];
    try {
      // Loop batch-by-batch until nothing but failures is left. The cap is a
      // safety backstop far above the real product count.
      for (let i = 0; i < 5000; i++) {
        const r = await migrateBatch(skip);
        skip = [...skip, ...r.failedIds];
        setRemaining(r.remaining);
        setFailedCount(skip.length);
        if (r.remaining <= skip.length) break;
      }
      setFinished(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Migration failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-purple-900">
          {doneCount} of {start} migrated
        </span>
        <span className="text-purple-900/60">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-purple-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-purple-900/60">
        {running
          ? `Migrating… ${remaining} left. Keep this tab open.`
          : finished
            ? failedCount > 0
              ? `Done. ${failedCount} image${failedCount === 1 ? "" : "s"} could not be copied (broken source) and were left as-is.`
              : "All product images are now hosted on your own S3 bucket. 🎉"
            : `${remaining} products still use Shopify's CDN.`}
      </p>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

      {!finished && (
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="mt-5 inline-flex items-center gap-2 rounded-lg gradient-purple-green px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Migrating…
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" /> Start migration
            </>
          )}
        </button>
      )}

      {finished && (
        <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-4 w-4" /> Migration complete
        </p>
      )}
    </div>
  );
}
