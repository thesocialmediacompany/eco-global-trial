import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Check, ChevronRight, BadgeCheck, ChefHat, ArrowRight, Leaf, ShieldCheck, Award } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { WaveDivider } from "@/components/home/WaveDivider";

// Alpino-style brand-benefit band shown on every product page (products carry
// no per-item badges, so these are the always-true Eco Global Foods promises).
const BRAND_BENEFITS = [
  { icon: Leaf, label: "100% Natural" },
  { icon: ShieldCheck, label: "No Additives" },
  { icon: BadgeCheck, label: "Halal Certified" },
  { icon: Award, label: "Made in Pakistan" },
];

// ISR: cache the rendered page at the CDN and re-query Neon at most once every
// 30 min. Around-the-clock bot crawls then hit the edge instead of waking the
// database on every request. Admin product saves call revalidatePath("/product
// /[slug]", "page") so price/stock/new-product edits still appear immediately.
export const revalidate = 10800;
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site-url";
import { getApprovedReviews, getReviewStats } from "@/lib/reviews";
import { getRecipePosts } from "@/lib/posts";
import { getSettings, settingNumber } from "@/lib/settings";
import { submitReview } from "@/app/(store)/product/actions";
import { ReviewForm } from "@/components/store/ReviewForm";
import { AddToCart } from "@/components/store/AddToCart";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductDetailsTabs } from "@/components/store/ProductDetailsTabs";
import { FaqAccordion } from "@/components/store/FaqAccordion";
import { WishlistButton } from "@/components/store/WishlistButton";
import { TrustBadges } from "@/components/store/TrustBadges";
import { SubscribeSave } from "@/components/store/SubscribeSave";
import { FrequentlyBoughtTogether } from "@/components/store/FrequentlyBoughtTogether";
import { RecentlyViewed } from "@/components/store/RecentlyViewed";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.imageUrl || product.images?.[0];
  return {
    title: product.seo.title,
    description: product.seo.description,
    keywords: product.seo.keywords,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      type: "website",
      url: `/product/${product.slug}`,
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.category
    ? await getRelatedProducts(product.category, product.slug)
    : [];

  const [reviews, stats, recipes, settings] = await Promise.all([
    getApprovedReviews(product.id),
    getReviewStats(product.id),
    getRecipePosts(),
    getSettings(),
  ]);
  const submitForProduct = submitReview.bind(null, product.id, product.slug);
  const freeShippingThreshold = settingNumber(settings, "freeShippingThreshold", 7000);

  // "Frequently bought together" = this product + up to 2 from the same range
  const fbt = !product.bundleContents
    ? [
        {
          productId: product.id,
          slug: product.slug,
          title: product.name,
          price: product.price,
          emoji: product.emoji,
          gradient: product.gradient,
          imageUrl: product.imageUrl,
          variantTitle: product.variants[0]?.title ?? "",
          weightGrams: product.variants[0]?.weightGrams ?? product.weightGrams,
        },
        ...related.slice(0, 2).map((r) => ({
          productId: r.id,
          slug: r.slug,
          title: r.name,
          price: r.price,
          emoji: r.emoji,
          gradient: r.gradient,
          imageUrl: r.imageUrl,
          variantTitle: r.flavours?.[0] ?? "",
          weightGrams: r.variants[0]?.weightGrams ?? r.weightGrams,
        })),
      ]
    : [];

  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const productImages = [
    ...new Set([product.imageUrl, ...(product.images ?? [])].filter(Boolean)),
  ];
  // Offers want a price-valid date; refreshed on each ISR regeneration.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo.description,
    ...(productImages.length ? { image: productImages } : {}),
    sku: product.slug,
    brand: { "@type": "Brand", name: "Eco Global Foods" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: "PKR",
      priceValidUntil,
      // Reflect real stock rather than always claiming InStock.
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        // Represents the store's free-delivery offer (over the free-shipping
        // threshold); checkout computes the exact weight-based amount.
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "PKR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
        },
      },
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <div className="pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {product.faqs && product.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: product.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      )}

      {/* breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <nav className="flex items-center gap-1.5 text-sm text-purple-900/50">
          <Link href="/" className="hover:text-purple-900">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/shop" className="hover:text-purple-900">Shop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-purple-900">{product.name}</span>
        </nav>
      </div>

      {/* main */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* gallery + frequently bought together (fills the space under the images) */}
        <div className="flex flex-col gap-8">
          <Reveal direction="right">
            <ProductGallery
              name={product.name}
              emoji={product.emoji}
              gradient={product.gradient}
              imageUrl={product.imageUrl}
              images={product.images}
              isNew={product.isNew}
              isBestseller={product.isBestseller}
            />
          </Reveal>
          {fbt.length > 1 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-bold uppercase text-purple-900">
                Frequently bought together
              </h2>
              <FrequentlyBoughtTogether items={fbt} />
            </div>
          )}
        </div>

        {/* info */}
        <div className="flex flex-col">
          {stats.average && (
            <a href="#reviews" className="mb-3 flex items-center gap-1.5 text-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(stats.average!)
                        ? "fill-gold-400 text-gold-400"
                        : "text-purple-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-purple-900/60 hover:text-purple-900">
                {stats.average} ({stats.count} review{stats.count === 1 ? "" : "s"})
              </span>
            </a>
          )}

          <h1 className="font-display text-4xl font-bold uppercase leading-[1.02] tracking-tight text-purple-900 sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-purple-900/70">{product.tagline}</p>

          {product.badges && product.badges.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-soft-sm"
                >
                  <Check className="h-3.5 w-3.5" /> {b}
                </span>
              ))}
            </div>
          )}

          <div className="my-7 h-px bg-purple-900/10" />

          <AddToCart
            productId={product.id}
            slug={product.slug}
            title={product.name}
            basePrice={product.price}
            compareAtPrice={product.compareAtPrice}
            emoji={product.emoji}
            gradient={product.gradient}
            imageUrl={product.imageUrl}
            variants={product.variants}
            freeShippingThreshold={freeShippingThreshold}
          />

          <div className="mt-4">
            <WishlistButton
              variant="full"
              className="w-full sm:w-auto"
              item={{
                productId: product.id,
                slug: product.slug,
                title: product.name,
                price: product.price,
                emoji: product.emoji,
                gradient: product.gradient,
                imageUrl: product.imageUrl,
              }}
            />
          </div>

          {!product.bundleContents && (
            <SubscribeSave productSlug={product.slug} productTitle={product.name} />
          )}

          {/* trust badges */}
          <div className="mt-8">
            <TrustBadges variant="full" />
          </div>
        </div>
      </div>

      {/* Alpino-style brand benefit band */}
      <section className="relative my-4 overflow-hidden bg-[linear-gradient(180deg,#dcefc6_0%,#eef3d2_50%,#fbedca_100%)] py-14 sm:py-16">
        <WaveDivider edge="top" fillClass="text-cream" />
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {BRAND_BENEFITS.map(({ icon: Icon, label }, i) => (
              <Reveal key={label} delay={i * 0.06}>
                <div className="flex flex-col items-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-green-600 shadow-soft transition-transform hover:-translate-y-1 sm:h-20 sm:w-20">
                    <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
                  </span>
                  <h3 className="mt-3.5 font-display text-sm font-bold uppercase leading-tight text-purple-900 sm:text-base">
                    {label}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <WaveDivider edge="bottom" fillClass="text-cream" />
      </section>

      {/* product details (full width) */}
      <div className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
        <h2 className="mb-4 font-display text-2xl font-bold uppercase text-purple-900">
          Product details
        </h2>
        <ProductDetailsTabs
          description={product.description}
          ingredients={product.ingredients}
          allergens={product.allergens}
          nutrition={product.nutrition}
          delivery={`We deliver across Pakistan in 2-5 working days. Free delivery on orders over ${formatPKR(freeShippingThreshold)}, with Cash on Delivery available. Not happy with your order? Our 30-day satisfaction promise has you covered.`}
        />

        {/* Per-product FAQs */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-display text-2xl font-bold uppercase text-purple-900">
              Frequently asked questions
            </h2>
            <FaqAccordion items={product.faqs} />
          </div>
        )}
      </div>

      {/* bundle contents */}
      {product.bundleContents && product.bundleContents.length > 0 && (
        <section className="border-t border-purple-900/5 bg-cream-dark/40 py-16">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <SectionHeading
              eyebrow="🎁 Bundle"
              title="What's inside"
              description={`${product.bundleContents.length} hand-picked products, together at a better price.`}
            />
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.bundleContents.map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  className="group flex items-center gap-4 rounded-[1.4rem] bg-white p-4 shadow-soft-sm ring-ink transition-all hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span
                    className={`relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[1.1rem] text-2xl ${
                      item.imageUrl ? "bg-white" : item.gradient
                    }`}
                  >
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill sizes="64px" className="object-cover" />
                    ) : (
                      item.emoji
                    )}
                    {item.quantity > 1 && (
                      <span className="absolute -right-1 -top-1 z-10 grid h-5 w-5 place-items-center rounded-full bg-purple-700 text-[0.65rem] font-bold text-cream">
                        {item.quantity}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-purple-900 group-hover:text-purple-700">
                      {item.title}
                    </span>
                    <span className="text-xs text-purple-900/55">
                      {item.quantity} × {formatPKR(item.price)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            {(() => {
              const value = product.bundleContents!.reduce(
                (s, i) => s + i.price * i.quantity,
                0,
              );
              const savings = value - product.price;
              return savings > 0 ? (
                <p className="mt-8 text-center text-sm text-purple-900/70">
                  Bought separately: <s>{formatPKR(value)}</s> · Bundle price:{" "}
                  <strong className="text-purple-900">{formatPKR(product.price)}</strong> ·{" "}
                  <span className="font-semibold text-green-700">
                    You save {formatPKR(savings)} 🎉
                  </span>
                </p>
              ) : null;
            })()}
          </div>
        </section>
      )}

      {/* reviews — Alpino-style wall */}
      <section id="reviews" className="relative overflow-hidden bg-[linear-gradient(180deg,#eef7e6_0%,#f6f2df_100%)] py-16">
        <WaveDivider edge="top" fillClass="text-cream" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-green-600">
              Real people, real reviews
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-purple-900 sm:text-5xl">
              Loved by our customers
            </h2>
            {stats.average && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft-sm ring-ink">
                <span className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(stats.average!) ? "fill-gold-400 text-gold-400" : "text-purple-900/15"}`}
                    />
                  ))}
                </span>
                <span className="font-display text-lg font-bold text-purple-900">{stats.average}</span>
                <span className="text-sm text-purple-900/55">
                  / 5 · {stats.count} review{stats.count === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
              {reviews.map((r) => {
                const initials = r.customerName
                  .trim()
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <div key={r.id} className="rounded-[1.4rem] bg-white p-5 shadow-soft-sm ring-ink">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? "fill-gold-400 text-gold-400" : "text-purple-900/15"}`}
                        />
                      ))}
                    </div>
                    {r.title && (
                      <p className="mt-2.5 font-display font-bold text-purple-900">{r.title}</p>
                    )}
                    <p className="mt-1.5 text-sm leading-relaxed text-purple-900/75">
                      &ldquo;{r.body}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                        {initials}
                      </span>
                      <span className="text-sm font-bold text-purple-900">{r.customerName}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-green-800">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-md rounded-[1.4rem] border border-dashed border-purple-900/15 bg-white/60 px-6 py-8 text-center">
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-purple-200" />
                ))}
              </div>
              <p className="mt-3 font-medium text-purple-900">
                Be the first to review {product.name}
              </p>
              <p className="mt-1 text-sm text-purple-900/55">
                Tried it? Share your thoughts to help other shoppers.
              </p>
            </div>
          )}

          <div className="mx-auto mt-12 max-w-2xl">
            <ReviewForm action={submitForProduct} />
          </div>
        </div>
        <WaveDivider edge="bottom" fillClass="text-cream" />
      </section>

      {/* recipe ideas */}
      {!product.bundleContents && recipes.length > 0 && (
        <section className="border-t border-purple-900/5 py-16">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <SectionHeading eyebrow="From our kitchen" title="Recipe ideas" />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {recipes.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-[1.4rem] bg-white p-5 shadow-soft-sm ring-ink transition-all hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="text-3xl">{post.coverEmoji}</div>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-green-800">
                    <ChefHat className="h-3 w-3" /> Recipe
                  </span>
                  <h3 className="mt-2 font-display text-base font-semibold leading-tight text-purple-900 group-hover:text-purple-700">
                    {post.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-700">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* related */}
      {related.length > 0 && (
        <section className="bg-cream-dark/40 py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="You may also like" title="More from this range" />
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* recently viewed (client, localStorage) */}
      <RecentlyViewed
        current={{
          slug: product.slug,
          title: product.name,
          price: product.price,
          emoji: product.emoji,
          gradient: product.gradient,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
}
