import { Hero } from "@/components/home/Hero";
import { HeroCarousel, type Poster } from "@/components/home/HeroCarousel";
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
import { getFeaturedProducts, getCategoryThumbs } from "@/lib/products";
import { getPageHero } from "@/lib/page-hero";
import { SITE_URL } from "@/lib/site-url";

// Serve the homepage from cache and rebuild at most every 30 min, so the
// constant crawler/customer traffic hits the CloudFront cache instead of
// running SSR compute (and a DB read) on every request. Admin product/settings
// saves already call revalidatePath("/"), so edits still show immediately.
export const revalidate = 10800;

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Eco Global Foods (SMC-PVT) Ltd.",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-full.png`,
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Eco Global Foods",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Eco Global Foods (SMC-PVT) Ltd.",
  image: `${SITE_URL}/brand/logo-full.png`,
  url: SITE_URL,
  telephone: "+92-304-3950505",
  priceRange: "₨₨",
  address: {
    "@type": "PostalAddress",
    streetAddress: "14 KM Multan Road, near Thokar Niaz Baig",
    addressLocality: "Lahore",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
  sameAs: [
    "https://instagram.com/ecoglobalfoods",
    "https://facebook.com/ecoglobalfoods",
    "https://www.linkedin.com/company/ecoglobalfoods",
  ],
};

export default async function Home() {
  const [s, homeCover, featured, categoryThumbs] = await Promise.all([
    getSettings(),
    getPageHero("home"),
    getFeaturedProducts(8),
    getCategoryThumbs(),
  ]);
  const heroProducts = featured.slice(0, 8).map((p) => ({
    slug: p.slug,
    name: p.name,
    imageUrl: p.imageUrl,
    emoji: p.emoji,
    gradient: p.gradient,
  }));

  // Three rotating hero posters (first is admin-editable via Settings).
  const heroPosters: Poster[] = [
    {
      badge: s.heroBadge,
      title: s.heroTitle,
      subtitle: s.heroSubtitle,
      shopHref: "#new-range",
      starburst: ["100%", "Natural"],
      template: "banner",
      base: "#f3e8d0",
      accent: "#ffce4a",
      image: "/covers/taste-goodness.jpg",
      packs: [
        { src: "/hero/oats.png", name: "Steel-Cut Oats", href: "/product/rolled-oats" },
        { src: "/hero/beetroot.png", name: "Beetroot Powder", href: "/product/eco-beetroot-powder" },
        { src: "/hero/flaxseed.png", name: "Whole Flaxseed", href: "/product/eco-flaxseed-whole" },
      ],
      annotations: [
        { label: "Wholesome!", side: "left" },
        { label: "Real Food", side: "right" },
      ],
    },
    {
      badge: "Breakfast, sorted",
      title: "Power Up Mornings",
      subtitle: "Wholegrain oats, granola & cereals — fibre-rich fuel for a busy day.",
      shopHref: "/category/oats-family",
      starburst: ["Hi", "Fibre"],
      template: "image",
      base: "#efe6d6",
      accent: "rgba(198,86,59,0.26)",
      image: "/covers/breakfast.jpg",
      packs: [
        { src: "/cutouts/granola-chocolate-cereals.png", name: "Chocolate Granola", href: "/product/granola-chocolate-cereals" },
        { src: "/cutouts/eco-steel-cut-oats.png", name: "Steel-Cut Oats", href: "/product/eco-steel-cut-oats" },
        { src: "/cutouts/muesli-swiss-style.png", name: "Swiss Muesli", href: "/product/muesli-swiss-style" },
      ],
      annotations: [
        { label: "Filling!", side: "left" },
        { label: "No Sugar", side: "right" },
      ],
    },
    {
      badge: "Pure & authentic",
      title: "Real Spice, Real Taste",
      subtitle: "Pure spices & masalas — no artificial colours, no fillers, just flavour.",
      shopHref: "/category/spices-spices",
      starburst: ["100%", "Pure"],
      template: "image",
      base: "#efe6d6",
      accent: "#9bd36a",
      image: "/covers/spices.jpg",
      packs: [
        { src: "/cutouts/eco-red-chilli-powder.png", name: "Red Chilli Powder", href: "/product/eco-red-chilli-powder" },
        { src: "/cutouts/eco-turmeric-powder.png", name: "Turmeric Powder", href: "/product/eco-turmeric-powder" },
        { src: "/cutouts/paprika-powder.png", name: "Paprika Powder", href: "/product/paprika-powder" },
      ],
      annotations: [
        { label: "Aromatic!", side: "left" },
        { label: "No Fillers", side: "right" },
      ],
    },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {homeCover?.mode === "slider" ? (
        <Hero badge={s.heroBadge} title={s.heroTitle} subtitle={s.heroSubtitle} cover={homeCover} products={heroProducts} />
      ) : (
        <HeroCarousel posters={heroPosters} />
      )}
      <CategoryGrid thumbs={categoryThumbs} />
      <ValueTicker values={s.valueTicker.split("|").map((t) => t.trim()).filter(Boolean)} />
      <FeaturedProducts />
      <SpecialOffers />
      <BrandStory s={s} />
      <KitchenBand />
      <WhyUs s={s} />
      <StockedAt />
      <WhyOrderOnline s={s} />
      <Newsletter
        heading={s.newsletterOfferEnabled === "true" ? s.newsletterHeading : ""}
        subtext={s.newsletterOfferEnabled === "true" ? s.newsletterSubtext : ""}
        offerEnabled={s.newsletterOfferEnabled === "true"}
      />
    </>
  );
}
