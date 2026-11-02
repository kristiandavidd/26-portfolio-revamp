import type { MetadataRoute } from "next";
import { PERSONAL_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${PERSONAL_URL}/`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${PERSONAL_URL}/story`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${PERSONAL_URL}/places`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${PERSONAL_URL}/gallery`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${PERSONAL_URL}/wishlist`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
