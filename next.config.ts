import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;