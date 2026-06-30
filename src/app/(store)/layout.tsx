import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { getSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping-config";

/** Google Search Console verification, via Next's head management (no manual
 * <head> — that caused a hydration crash). DB-safe with a try/catch fallback. */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const token = (await getSettings()).googleSiteVerification;
    return token ? { verification: { google: token } } : {};
  } catch {
    return {};
  }
}
import { getNavLinks } from "@/lib/navigation";
import { brandThemeCss } from "@/lib/theme";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { OccasionBanner } from "@/components/site/OccasionBanner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { FloatingButtons } from "@/components/site/FloatingButtons";
import { Analytics } from "@/components/site/Analytics";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, shippingConfig, headerNav] = await Promise.all([
    getSettings(),
    getShippingConfig(),
    getNavLinks("header"),
  ]);
  const themeCss = brandThemeCss(settings.brandPurple, settings.brandGreen);
  return (
    <WishlistProvider>
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <CartProvider shippingConfig={shippingConfig}>
        <OccasionBanner
          enabled={settings.occasionBannerEnabled === "true"}
          text={settings.occasionBannerText}
          emoji={settings.occasionBannerEmoji}
        />
        <AnnouncementBar />
        <Header navLinks={headerNav.map((l) => ({ label: l.label, href: l.href, mega: l.mega }))} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <FloatingButtons whatsappNumber={settings.whatsappNumber} />
        <Analytics ga4Id={settings.ga4MeasurementId} pixelId={settings.metaPixelId} />
      </CartProvider>
    </WishlistProvider>
  );
}
