"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { defaultSettings, type SettingKey } from "@/lib/settings-defaults";

const editableKeys: SettingKey[] = [
  "storeName",
  "storeLegalName",
  "storeTagline",
  "storeEmail",
  "storePhone",
  "storePhoneRaw",
  "storePhoneSecondary",
  "storePhoneSecondaryRaw",
  "storeAddress",
  "instagramUrl",
  "facebookUrl",
  "linkedinUrl",
  "youtubeUrl",
  "tiktokUrl",
  "googleUrl",
  "whatsappNumber",
  "freeShippingThreshold",
  "flatShippingRate",
  "announcements",
  "footerCredit",
  "footerCreditUrl",
  "ga4MeasurementId",
  "metaPixelId",
  "occasionBannerEnabled",
  "occasionBannerText",
  "occasionBannerEmoji",
  "heroBadge",
  "heroTitle",
  "heroSubtitle",
  "newsletterHeading",
  "newsletterSubtext",
  "stockistHeading",
  "stockistSubtext",
  "payCod",
  "payJazzcash",
  "payEasypaisa",
  "payCard",
  "payBank",
];

const toggleKeys: SettingKey[] = [
  "payCod",
  "payJazzcash",
  "payEasypaisa",
  "payCard",
  "payBank",
  "occasionBannerEnabled",
];

export async function updateSettings(formData: FormData) {
  for (const key of editableKeys) {
    let value: string;
    if (toggleKeys.includes(key)) {
      value = formData.get(key) === "on" ? "true" : "false";
    } else {
      value = String(formData.get(key) ?? defaultSettings[key]);
    }
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // refresh storefront header/footer/announcements
}
