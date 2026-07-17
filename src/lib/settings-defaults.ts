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
  // Homepage: "Why choose us" band (icons stay fixed; text is editable)
  whyUsEyebrow: "Why Eco Global Foods",
  whyUsTitle: "Food you can trust",
  whyUsDescription:
    "We have been making food in Pakistan since 1999. Here is what you get with every order.",
  whyUsF1Title: "Natural & Pure",
  whyUsF1Body: "No artificial flavours or additives. Just good ingredients you can pronounce.",
  whyUsF2Title: "Safe Payments",
  whyUsF2Body: "Pay your way: Cash on Delivery, JazzCash, Easypaisa, card or bank transfer.",
  whyUsF3Title: "Nationwide Delivery",
  whyUsF3Body: "Fast, tracked delivery across Pakistan. Free shipping on orders over Rs 7,000.",
  whyUsF4Title: "Here to Help",
  whyUsF4Body: "A real team on call, plus a 30-day satisfaction promise on every order.",
  // Homepage: "Our story" band
  brandStoryEyebrow: "Our Story",
  brandStoryTitle: "Making good food since 1999",
  brandStoryBody:
    "Eco Global Foods is a Lahore based food manufacturer. For over 25 years we have put real ingredients first and kept the shortcuts out. Food should be honest, taste good and do you good. That is the whole idea.",
  brandStoryStat1Value: "1999",
  brandStoryStat1Label: "In business since",
  brandStoryStat2Value: "Lahore",
  brandStoryStat2Label: "Made in",
  brandStoryStat3Value: "Natural",
  brandStoryStat3Label: "Ingredients, always",
  // Homepage: "Why order online" band
  whyOnlineEyebrow: "Why order online",
  whyOnlineTitle: "Love it at the store? You'll love it at your door.",
  whyOnlineBody:
    "Buying direct gets you the whole range, doorstep delivery, and an offer you won't find on the shelf.",
  whyOnlineP1Title: "The full range, in one place",
  whyOnlineP1Body:
    "Over 120 products, far more than any single shelf carries. Find every flavour and size here.",
  whyOnlineP2Title: "Doorstep Cash on Delivery",
  whyOnlineP2Body:
    "Skip the trip. We deliver across Pakistan and you pay at your door, no card needed.",
  whyOnlineP3Title: "Online-only welcome offer",
  whyOnlineP3Body: "New here? Use code WELCOME20 at checkout for 20% off your first order.",
  // About page: intro long-form (separate paragraphs with a blank line)
  aboutEyebrow: "About",
  aboutHeading: "Wholesome choices for modern living",
  aboutBody:
    "Eco Global Foods (SMC-PVT) Ltd. stands at the forefront of the food manufacturing industry, integrating technology, knowledge and innovation to achieve excellence in food processing and advance the food ingredients and value chain in agribusiness.\n\nSince our inception in 1999, we have been committed to delivering high-quality food products to meet the evolving needs of consumers and businesses alike.",
  aboutBadge: "25+ Years of Experience",
  aboutMissionTitle: "Mission Statement",
  aboutMissionBody:
    "Our mission is to be a leading provider of innovative and sustainable food solutions, leveraging our expertise in food processing, supply chain management, and product development to deliver exceptional value to our customers. We are dedicated to maintaining the highest standards of quality, safety, and customer satisfaction in everything we do.",
  aboutConceptTitle: "Our Concept",
  aboutConceptBody:
    "At Eco Global Foods, we operate on the principles of efficiency, sustainability, and customer-centricity. Our team of skilled professionals works tirelessly to optimise our supply chain, streamline production processes, and innovate new products to meet market demands. We strive to establish long-term partnerships with our customers and suppliers, built on trust, transparency, and mutual respect.",
  // Email sending (SMTP). Fill these to connect a real mailbox; falls back to
  // SMTP_* env vars if blank. Used for order, newsletter and campaign emails.
  smtpHost: "", // e.g. smtp.gmail.com / smtp.zoho.com
  smtpPort: "587",
  smtpUser: "", // the email address / username
  smtpPass: "", // app password
  smtpFromName: "Eco Global Foods",
  smtpFromEmail: "", // the "from" address shown to recipients
  // Where new-order alerts and the daily summary are sent. Blank = fall back to
  // storeEmail. Comma-separate to notify more than one address.
  orderNotifyEmail: "",
  // Brand colours. Leave blank to use the built-in purple/green theme. When set
  // (hex like #3b1538), the site's gradients (hero, buttons, category cards,
  // banners) are regenerated from these two anchor colours.
  brandPurple: "", // primary / purple anchor, e.g. #3b1538
  brandGreen: "", // secondary / green anchor, e.g. #233f18
} as const;

export type SettingKey = keyof typeof defaultSettings;
export type StoreSettings = Record<SettingKey, string>;
