import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf ships its own font/layout engine; keep it out of the bundle and
  // require it from node_modules at runtime, which is the reliable setup for it
  // on the Lambda SSR runtime.
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
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
    ];
  },
};

export default nextConfig;