import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
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
  verification: {
    google: "0w7Bxs3CDqIKOP_USqL9O_62xvj6f3cfpjvNqfit6FQ",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-ink flex flex-col overflow-x-hidden">
        {children}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KQMBZ1CQJY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KQMBZ1CQJY');
          `}
        </Script>
      </body>
    </html>
  );
}