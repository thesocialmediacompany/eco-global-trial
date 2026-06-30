import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eco Global Foods | Taste The Goodness",
    template: "%s | Eco Global Foods",
  },
  description:
    "Eco Global Foods (SMC-PVT) Ltd. makes granola, instant oats, malted drinks, protein bars and natural pantry staples in Pakistan. Real ingredients, made here since 1999.",
  keywords: [
    "Eco Global Foods",
    "granola",
    "instant oats",
    "protein bars",
    "malted milk",
    "natural foods Pakistan",
    "healthy breakfast",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Eco Global Foods",
    title: "Eco Global Foods | Taste The Goodness",
    description:
      "Granola, oats, malted drinks and protein bars made with natural ingredients in Pakistan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eco Global Foods | Taste The Goodness",
    description: "Natural food made in Pakistan since 1999.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Google Search Console verification token (admin-editable). DB-safe: a hiccup
  // just omits the tag rather than breaking the page.
  let googleVerification = "";
  try {
    const { getSettings } = await import("@/lib/settings");
    googleVerification = (await getSettings()).googleSiteVerification;
  } catch {
    /* ignore — render without the verification meta */
  }
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}
      </head>
      <body className="min-h-full bg-cream text-ink flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
