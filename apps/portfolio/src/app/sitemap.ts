import type { MetadataRoute } from "next";
import { getSiteContent } from "@repo/db";
import { SITE_URL } from "@/lib/seo";

// Project slugs live in the database, so the sitemap is built per request
// instead of being frozen at deploy time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteContent();

  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
