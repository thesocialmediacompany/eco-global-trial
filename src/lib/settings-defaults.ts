/**
 * Default store settings. These power the customisable backend: the admin can
 * override any of these (persisted to the Setting table) and the storefront
 * reads the merged result via src/lib/settings.ts. Plain module so it can be
 * imported by both the app and the seed/import scripts.
 */
export const defaultSettings = {
  storeName: "Eco Global Foods",
  storeLegalName: "Eco Global Foods (SMC-PVT) Ltd.",
  storeTagline: "Taste The Goodness",
  storeEmail: "support@ecoglobalfoods.com",
  storePhone: "(+92) 304 395 0505",
  storePhoneRaw: "+923043950505",
  // optional backup / secondary contact number (leave blank to hide)
  storePhoneSecondary: "",
  storePhoneSecondaryRaw: "",
  storeAddress: "14 KM Multan Rd, behind Uni Foam, near Thokar Niaz Baig, Lahore",
  instagramUrl: "https://instagram.com/ecoglobalfoods",
  facebookUrl: "https://facebook.com/ecoglobalfoods",
  linkedinUrl: "https://www.linkedin.com/company/ecoglobalfoods",
  youtubeUrl: "https://www.youtube.com/@ecoglobalfoods",
  tiktokUrl: "https://www.tiktok.com/@ecoglobalfoods",
  googleUrl: "https://maps.google.com/?q=Eco+Global+Foods+Lahore",
  whatsappNumber: "+923043950505",
  // money (PKR)
  freeShippingThreshold: "7000",
  flatShippingRate: "250",
  currency: "PKR",
  // marketing - announcement bar messages, separated by "|"
  announcements:
    "🌿 Free shipping on orders over Rs 7,000|✨ 20% off our newly launched range|🚚 Cash on Delivery across Pakistan|🏆 Natural, pure ingredients since 1999",
  // payment method toggles
  payCod: "true",
  payJazzcash: "true",
  payEasypaisa: "true",
  payCard: "true",
  payBank: "true",
  // footer credit
  footerCredit: "Designed by tsmc.pk",
  footerCreditUrl: "https://tsmc.pk",
  // analytics / marketing pixels (leave blank to disable)
  ga4MeasurementId: "G-KQMBZ1CQJY",
  // Google Search Console: paste the "HTML tag" content value (the token only).
  googleSiteVerification: "", // e.g. G-XXXXXXXXXX
  metaPixelId: "", // e.g. 1234567890
  // occasion / opening sticker shown across the top of the site
  occasionBannerEnabled: "false",
  occasionBannerText: "Eid Mubarak from all of us at Eco Global Foods 🌙",
  occasionBannerEmoji: "🎉",
  // editable storefront copy (the team can change these without code)
  heroBadge: "New range now in stock",
  heroTitle: "Taste The Goodness",
  heroSubtitle:
    "Granola, oats, malted drinks and protein bars made with natural, pure ingredients. Real food for real life, packed in Pakistan since 1999.",
  // Turn off when no discount is running so you don't promise an offer you
  // aren't honouring (shows neutral "Join our newsletter" copy instead).
  // Scrolling brand-words band under the hero (separate with "|").
  valueTicker:
    "Natural & Pure|No Artificial Flavours|High Protein|Whole Grains|Fibre Rich|Responsibly Sourced|Made in Pakistan|Since 1999",
  newsletterOfferEnabled: "true",
  newsletterHeading: "Get 20% off your first order",
  newsletterSubtext:
    "Join our list for new products, recipes and offers. We will send your discount code straight away.",
  stockistHeading: "Also available at leading stores",
  stockistSubtext:
    "Find Eco Global Foods on the shelves of Pakistan's most trusted supermarkets and pharmacies.",
  // Email sending (SMTP). Fill these to connect a real mailbox; falls back to
  // SMTP_* env vars if blank. Used for order, newsletter and campaign emails.
  smtpHost: "", // e.g. smtp.gmail.com / smtp.zoho.com
  smtpPort: "587",
  smtpUser: "", // the email address / username
  smtpPass: "", // app password
  smtpFromName: "Eco Global Foods",
  smtpFromEmail: "", // the "from" address shown to recipients
  // Brand colours. Leave blank to use the built-in purple/green theme. When set
  // (hex like #3b1538), the site's gradients (hero, buttons, category cards,
  // banners) are regenerated from these two anchor colours.
  brandPurple: "", // primary / purple anchor, e.g. #3b1538
  brandGreen: "", // secondary / green anchor, e.g. #233f18
} as const;

export type SettingKey = keyof typeof defaultSettings;
export type StoreSettings = Record<SettingKey, string>;
