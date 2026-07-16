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
  "googleSiteVerification",
  "metaPixelId",
  "smtpHost",
  "smtpPort",
  "smtpUser",
  "smtpPass",
  "smtpFromName",
  "smtpFromEmail",
  "occasionBannerEnabled",
  "occasionBannerText",
  "occasionBannerEmoji",
  "heroBadge",
  "heroTitle",
  "heroSubtitle",
  "newsletterOfferEnabled",
  "newsletterHeading",
  "newsletterSubtext",
  "stockistHeading",
  "stockistSubtext",
  "valueTicker",
  // Homepage: Why choose us
  "whyUsEyebrow",
  "whyUsTitle",
  "whyUsDescription",
  "whyUsF1Title",
  "whyUsF1Body",
  "whyUsF2Title",
  "whyUsF2Body",
  "whyUsF3Title",
  "whyUsF3Body",
  "whyUsF4Title",
  "whyUsF4Body",
  // Homepage: Our story
  "brandStoryEyebrow",
  "brandStoryTitle",
  "brandStoryBody",
  "brandStoryStat1Value",
  "brandStoryStat1Label",
  "brandStoryStat2Value",
  "brandStoryStat2Label",
  "brandStoryStat3Value",
  "brandStoryStat3Label",
  // Homepage: Why order online
  "whyOnlineEyebrow",
  "whyOnlineTitle",
  "whyOnlineBody",
  "whyOnlineP1Title",
  "whyOnlineP1Body",
  "whyOnlineP2Title",
  "whyOnlineP2Body",
  "whyOnlineP3Title",
  "whyOnlineP3Body",
  // About page
  "aboutEyebrow",
  "aboutHeading",
  "aboutBody",
  "aboutBadge",
  "aboutMissionTitle",
  "aboutMissionBody",
  "aboutConceptTitle",
  "aboutConceptBody",
  "brandPurple",
  "brandGreen",
  "payCod",
  "payJazzcash",
  "payEasypaisa",
  "payCard",
  "payBank",
];

const toggleKeys: SettingKey[] = [
  "newsletterOfferEnabled",
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

/** Save the SMTP fields from the form, then send a test email to verify them. */
export async function sendSettingsTestEmail(formData: FormData) {
  const to = String(formData.get("testEmailTo") ?? "").trim();
  if (!to) return;

  // Persist the email-sending fields first so the test uses what's on screen.
  const smtpKeys: SettingKey[] = [
    "smtpHost",
    "smtpPort",
    "smtpUser",
    "smtpPass",
    "smtpFromName",
    "smtpFromEmail",
  ];
  for (const key of smtpKeys) {
    const value = String(formData.get(key) ?? defaultSettings[key]);
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  const { sendTestEmail } = await import("@/lib/email");
  await sendTestEmail(to).catch((e) => console.error("test email failed:", e));
  revalidatePath("/admin/settings");
}
