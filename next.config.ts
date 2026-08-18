import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf ships its own font/layout engine; keep it out of the bundle and
  // require it from node_modules at runtime, which is the reliable setup for it
  // on the Lambda SSR runtime.
  serverExternalPackages: ["@react-pdf/renderer", "web-push"],
  images: {
    // Cache optimized images for 30 days. Without this the default is ~60s, so
    // Amplify re-runs its image optimizer (compute + a re-fetch of the source)
    // for the same product photos over and over as crawlers/visitors hit pages.
    // Safe to cache long: a changed photo is uploaded under a new S3 URL, so it
    // never serves a stale image.
    minimumCacheTTL: 2_592_000,
    remotePatterns: [
      // Real product photography served from the Shopify CDN.
      { protocol: "https", hostname: "cdn.shopify.com" },
      // Admin-uploaded images stored in Amazon S3 (any bucket/region).
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "ecoglobalfoods.com" }],
        destination: "https://www.ecoglobalfoods.com/:path*",
        permanent: true,
      },
      // --- Preserve SEO from the old Shopify store's URL structure (301s) so
      // already-indexed links keep their ranking on the new site. ---
      { source: "/collections/:collection/products/:slug", destination: "/product/:slug", permanent: true },
      { source: "/products/:slug", destination: "/product/:slug", permanent: true },
      { source: "/collections/all", destination: "/shop", permanent: true },
      { source: "/collections/new-arrivals", destination: "/shop", permanent: true },
      { source: "/collections/top-selling-products", destination: "/shop", permanent: true },
      { source: "/collections/recipe-recipe", destination: "/recipes", permanent: true },
      { source: "/collections/:slug", destination: "/category/:slug", permanent: true },
      { source: "/pages/whoweare", destination: "/about", permanent: true },
      { source: "/pages/who-we-are", destination: "/about", permanent: true },
      { source: "/pages/about-us", destination: "/about", permanent: true },
      { source: "/pages/contact", destination: "/contact", permanent: true },
      { source: "/pages/contact-us", destination: "/contact", permanent: true },
      { source: "/pages/faqs", destination: "/faq", permanent: true },
      { source: "/pages/faq", destination: "/faq", permanent: true },
      { source: "/blogs/:blog/:article", destination: "/blog/:article", permanent: true },
      { source: "/blogs/:blog", destination: "/blog", permanent: true },

      // --- Product slugs corrected to match their real pack weight (the old
      // slugs were frozen at an earlier size). 301 the old URLs to the new ones
      // so indexed/shared links keep working and pass their ranking on. ---
      { source: "/product/garlic-powder-500gm", destination: "/product/garlic-powder-1kg", permanent: true },
      { source: "/product/ginger-powder-500gm", destination: "/product/ginger-powder-1kg", permanent: true },
      { source: "/product/black-pepper-whole-200gm", destination: "/product/black-pepper-whole-1kg", permanent: true },
      { source: "/product/red-chilli-whole-200gm", destination: "/product/red-chilli-whole-1kg", permanent: true },
      { source: "/product/garam-masala-whole-500gm", destination: "/product/garam-masala-whole-1kg", permanent: true },
      { source: "/product/garam-masala-powder-500gm", destination: "/product/garam-masala-powder-1kg", permanent: true },
      { source: "/product/potato-starch-25kg", destination: "/product/potato-starch-10kg", permanent: true },

      // --- Corrected misspelled product slugs. 301 the old typo URLs. ---
      { source: "/product/chciken-powder-1-kg", destination: "/product/chicken-powder-1-kg", permanent: true },
      { source: "/product/fried-chicken-merination-1-kg", destination: "/product/fried-chicken-marination-1-kg", permanent: true },
      { source: "/product/flaxseed-whole-5kgkg", destination: "/product/flaxseed-whole-5kg", permanent: true },
    ];
  },
};

export default nextConfig;