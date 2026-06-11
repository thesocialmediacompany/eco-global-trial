import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  defaultSettings,
  type StoreSettings,
  type SettingKey,
} from "@/lib/settings-defaults";

/**
 * Read store settings, layering DB overrides over the defaults. Cached per
 * request so multiple components (header, footer, checkout) share one query.
 */
export const getSettings = cache(async (): Promise<StoreSettings> => {
  let rows: { key: string; value: string }[] = [];
  try {
    rows = await prisma.setting.findMany();
  } catch {
    rows = [];
  }
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...defaultSettings, ...overrides } as StoreSettings;
});

/** Parse helpers */
export function settingNumber(s: StoreSettings, key: SettingKey, fallback = 0) {
  const n = Number(s[key]);
  return Number.isFinite(n) ? n : fallback;
}

export function settingBool(s: StoreSettings, key: SettingKey) {
  return s[key] === "true";
}

export function announcementList(s: StoreSettings) {
  return s.announcements.split("|").map((x) => x.trim()).filter(Boolean);
}
