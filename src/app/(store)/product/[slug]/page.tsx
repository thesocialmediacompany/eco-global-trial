import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Check, ChevronRight, BadgeCheck, ChefHat, ArrowRight } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getApprovedReviews, getReviewStats } from "@/lib/reviews";
import { getRecipePosts } from "@/lib/posts";
import { getSettings, settingNumber } from "@/lib/settings";
import { submitReview } from "@/app/(store)/product/actions";
import { ReviewForm } from "@/components/store/ReviewForm";
import { ReviewsSummary } from "@/components/store/ReviewsSummary";
import { AddToCart } from "@/components/store/AddToCart";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductDetailsTabs } from "@/components/store/ProductDetailsTabs";
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo.description,
    brand: { "@type": "Brand", name: "Eco Global Foods" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
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

  return (
    <div className="pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
        {/* gallery */}
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

        {/* info */}
        <div className="flex flex-col justify-center">
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

          <h1 className="font-display text-4xl font-semibold tracking-tight text-purple-900 sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-purple-900/70">{product.tagline}</p>

          {product.badges && product.badges.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800"
                >
                  <Check className="h-3.5 w-3.5" /> {b}
                </span>
              ))}
            </div>
          )}

          <div className="my-7 h-px bg-purple-100" />

          <AddToCart
            productId={product.id}
            slug={product.slug}
            title={product.name}
            basePrice={product.price}
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

      {/* product details + frequently bought together */}
      <div className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="mb-4 font-display text-2xl font-semibold text-purple-900">
              Product details
            </h2>
            <ProductDetailsTabs
              description={product.description}
              ingredients={product.ingredients}
              allergens={product.allergens}
              nutrition={product.nutrition}
              delivery={`We deliver across Pakistan in 2-5 working days. Free delivery on orders over ${formatPKR(freeShippingThreshold)}, with Cash on Delivery available. Not happy with your order? Our 30-day satisfaction promise has you covered.`}
            />
          </div>
          {fbt.length > 1 && (
            <div>
              <h2 className="mb-4 font-display text-2xl font-semibold text-purple-900">
                Frequently bought together
              </h2>
              <FrequentlyBoughtTogether items={fbt} />
            </div>
          )}
        </div>
      </div>

      {/* bundle contents */}
      {product.bundleContents && product.bundleContents.length > 0 && (
        <section className="border-t border-purple-100 bg-cream-dark/40 py-16">
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
                  className="group flex items-center gap-4 rounded-2xl border border-purple-100 bg-white p-4 transition hover:border-purple-300 hover:shadow-sm"
                >
                  <span
                    className={`relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl text-2xl ${
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

      {/* reviews */}
      <section id="reviews" className="border-t border-purple-100 py-16">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-3xl font-semibold text-purple-900">
              Customer reviews
            </h2>
            {stats.average && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold-400 text-gold-400" />
                <span className="font-display text-xl font-semibold text-purple-900">
                  {stats.average}
                </span>
                <span className="text-sm text-purple-900/50">/ 5 · {stats.count}</span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-5">
              {stats.average && (
                <ReviewsSummary
                  average={stats.average}
                  count={stats.count}
                  ratings={reviews.map((r) => r.rating)}
                />
              )}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-purple-100 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-medium text-purple-900">
                      {r.customerName}
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.65rem] font-semibold text-green-800">
                        <BadgeCheck className="h-3 w-3" /> Verified Buyer
                      </span>
                    </span>
                    <div className="flex shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.rating ? "fill-gold-400 text-gold-400" : "text-purple-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.title && (
                    <p className="mt-2 font-semibold text-purple-900">{r.title}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-purple-900/70">{r.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed border-purple-200 bg-cream/40 px-6 py-8 text-center">
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

          <div className="mt-8">
            <ReviewForm action={submitForProduct} />
          </div>
        </div>
      </section>

      {/* recipe ideas */}
      {!product.bundleContents && recipes.length > 0 && (
        <section className="border-t border-purple-100 py-16">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <SectionHeading eyebrow="From our kitchen" title="Recipe ideas" />
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {recipes.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-purple-100 bg-white p-5 transition hover:shadow-sm"
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
