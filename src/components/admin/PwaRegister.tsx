"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes the admin installable (PWA) and lets
 * it receive push. Scoped to /admin — narrower than the worker's own path — so
 * it only governs admin pages and never touches the storefront.
 */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/admin" }).catch(() => {});
    }
  }, []);
  return null;
}
