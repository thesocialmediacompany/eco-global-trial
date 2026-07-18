"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, BellOff, Loader2 } from "lucide-react";
import { VAPID_PUBLIC_KEY } from "@/lib/push-public";

type State = "unsupported" | "off" | "on" | "denied" | "busy";

/** The applicationServerKey must be a Uint8Array of the decoded VAPID key. */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Opt-in control for order push alerts. Renders nothing where push can't work
 * (e.g. iOS Safari before the app is added to the home screen), so it never
 * shows a button that would only fail.
 */
export function PushToggle() {
  const [state, setState] = useState<State>("busy");

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!supported) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  async function enable() {
    setState("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setState(res.ok ? "on" : "off");
    } catch {
      setState("off");
    }
  }

  async function disable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/admin/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("on");
    }
  }

  if (state === "unsupported") return null;

  if (state === "denied") {
    return (
      <span
        title="Notifications are blocked. Enable them for this site in your browser settings."
        className="grid h-9 w-9 place-items-center rounded-lg text-purple-900/30"
      >
        <BellOff className="h-[1.15rem] w-[1.15rem]" />
      </span>
    );
  }

  if (state === "busy") {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-lg text-purple-900/50">
        <Loader2 className="h-[1.15rem] w-[1.15rem] animate-spin" />
      </span>
    );
  }

  const on = state === "on";
  return (
    <button
      onClick={on ? disable : enable}
      aria-label={on ? "Order alerts on — tap to turn off" : "Enable order alerts on this device"}
      title={on ? "Order alerts on — tap to turn off" : "Enable order alerts on this device"}
      className={`relative grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-purple-50 ${
        on ? "text-green-600" : "text-purple-900/70"
      }`}
    >
      {on ? <BellRing className="h-[1.15rem] w-[1.15rem]" /> : <Bell className="h-[1.15rem] w-[1.15rem]" />}
      {on && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-green-500" />}
    </button>
  );
}
