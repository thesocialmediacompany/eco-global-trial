import { Hero } from "@/components/home/Hero";
import { ValueTicker } from "@/components/home/ValueTicker";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BrandStory } from "@/components/home/BrandStory";
import { KitchenBand } from "@/components/home/KitchenBand";
import { WhyUs } from "@/components/home/WhyUs";
import { StockedAt } from "@/components/home/StockedAt";
import { WhyOrderOnline } from "@/components/home/WhyOrderOnline";
import { Newsletter } from "@/components/home/Newsletter";
import { getSettings } from "@/lib/settings";
import { getPageHero } from "@/lib/page-hero";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Eco Global Foods (SMC-PVT) Ltd.",
  url: "https://www.ecoglobalfoods.com",
  foundingDate: "1999",
  description:
    "Granola, instant oats, malted drinks, protein bars and natural pantry staples, made in Pakistan since 1999.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "14 KM Multan Road, near Thokar Niaz Baig",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92-304-3950505",
    email: "support@ecoglobalfoods.com",
    contactType: "customer service",
  },
  sameAs: [
    "https://instagram.com/ecoglobalfoods",
    "https://facebook.com/ecoglobalfoods",
  ],
};

export default async function Home() {
  const [s, homeCover] = await Promise.all([getSettings(), getPageHero("home")]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Hero badge={s.heroBadge} title={s.heroTitle} subtitle={s.heroSubtitle} cover={homeCover} />
      <ValueTicker />
      <FeaturedProducts />
      <SpecialOffers />
      <CategoryGrid />
      <BrandStory />
      <KitchenBand />
      <WhyUs />
      <StockedAt />
      <WhyOrderOnline />
      <Newsletter
        heading={s.newsletterOfferEnabled === "true" ? s.newsletterHeading : ""}
        subtext={s.newsletterOfferEnabled === "true" ? s.newsletterSubtext : ""}
        offerEnabled={s.newsletterOfferEnabled === "true"}
      />
    </>
  );
}
