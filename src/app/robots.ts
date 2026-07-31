import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// AI-training / scraper crawlers that fetch the whole catalog for model
// training and bring zero customers — they were the biggest slice of bot
// traffic (Meta's AI agent alone was the #1 crawler) and every uncached hit
// costs Amplify SSR compute + data transfer. Blocking them here is safe: it
// does NOT affect search ranking (Googlebot/Bingbot stay fully allowed) and
// does NOT touch Facebook/Instagram link previews (facebookexternalhit is a
// different agent we leave alone). Compliant bots (Google, OpenAI, Anthropic,
// Meta's AI agent) honour this immediately; the rest we drop at the WAF.
const AI_SCRAPERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "Meta-ExternalAgent",
  "meta-externalfetcher",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "cohere-ai",
  "PerplexityBot",
  "Bytespider",
  "CCBot",
  "Diffbot",
  "Omgilibot",
  "Omgili",
  "ImagesiftBot",
  "DataForSeoBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
];

// Private / non-indexable areas kept off every crawler.
const PRIVATE_PATHS = [
  "/admin",
  "/account",
  "/checkout",
  "/cart",
  "/wishlist",
  "/order",
  "/track",
  "/search",
  "/newsletter/unsubscribe",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Everyone else (real search engines, social link previews): index the
      // public store, stay out of the private areas.
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      // AI trainers / scrapers: nothing.
      { userAgent: AI_SCRAPERS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
