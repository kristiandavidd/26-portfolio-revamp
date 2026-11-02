/**
 * One place for the canonical addresses and the facts crawlers should agree on.
 * The fallback matches the production domain, so a missing env var locally still
 * produces absolute URLs rather than relative ones in metadata, sitemaps and
 * structured data.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id"
).replace(/\/$/, "");

export const PERSONAL_URL = (
  process.env.NEXT_PUBLIC_PERSONAL_URL || "https://personal.kristiandav.id"
).replace(/\/$/, "");

/** The role the whole site is built around. */
export const JOB_TITLE = "Fullstack Software Engineer";

/** Stable @id so the person is one entity across the site and the personal side. */
export const PERSON_ID = `${SITE_URL}/#person`;

/** Technologies the work actually uses, used in knowsAbout and llms.txt. */
export const EXPERTISE = [
  "Fullstack web development",
  "Laravel",
  "Next.js",
  "React",
  "TypeScript",
  "PHP",
  "Node.js",
  "MySQL",
  "REST APIs",
  "Internet of Things",
  "Cloud computing",
];
