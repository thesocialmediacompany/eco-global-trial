"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RotateCw } from "lucide-react";

/**
 * Re-fetch the current admin page's data.
 *
 * router.refresh() re-runs the server components for this route and drops the
 * client router cache, so figures update without a full page reload — and
 * without losing scroll position or whatever's typed into a form. Wrapped in a
 * transition so the icon can spin while the new data is on its way.
 */
export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      aria-label={pending ? "Refreshing" : "Refresh data"}
      title="Refresh data"
      className="grid h-9 w-9 place-items-center rounded-lg text-purple-900/70 transition-colors hover:bg-purple-50 disabled:cursor-wait"
    >
      <RotateCw className={`h-[1.15rem] w-[1.15rem] ${pending ? "animate-spin" : ""}`} />
    </button>
  );
}
