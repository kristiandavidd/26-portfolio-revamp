import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Every public route is meant to be read, by search engines and by answer
 * engines alike. The assistant crawlers are named explicitly rather than left
 * to the wildcard, because a handful of hosts treat a missing entry as a block.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
