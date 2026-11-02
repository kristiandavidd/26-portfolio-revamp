import { getSiteContent } from "@repo/db";
import { EXPERTISE, JOB_TITLE, PERSONAL_URL, SITE_URL } from "@/lib/seo";

// The list grows with the database, so it is rendered per request.
export const dynamic = "force-dynamic";

/** Certifications carry intentional line breaks for the wall; flatten them here. */
function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * A plain-text brief for answer engines: who this is, what the role is, what the
 * work contains, and where the canonical facts live. Built from the same rows as
 * the page so it cannot drift from what a reader sees.
 */
export async function GET() {
  const content = await getSiteContent();
  const { profile, experience, projects, dephilia, certifications, community } =
    content;

  const role = clean(profile.role) || JOB_TITLE;
  const location = clean(profile.location);
  const description = clean(content.settings.siteDescription);

  const lines: string[] = [
    `# ${profile.name}`,
    "",
    `> ${description}`,
    "",
    `- Name: ${profile.name}`,
    `- Role: ${role}`,
    location ? `- Location: ${location}` : "",
    profile.email ? `- Contact: ${profile.email}` : "",
    `- Canonical site: ${SITE_URL}`,
    `- Personal site: ${PERSONAL_URL}`,
    "",
    "## About",
    "",
    clean(profile.bio) || `${profile.name} is a ${role.toLowerCase()}.`,
    "",
    "## Expertise",
    "",
    ...EXPERTISE.map((item) => `- ${item}`),
    "",
    "## Company",
    "",
    `- ${dephilia.name} (${dephilia.legalName}) — ${dephilia.role}. ${clean(dephilia.description)} ${dephilia.url}`,
    "",
    "## Experience",
    "",
    ...experience.map(
      (item) => `- ${item.company} — ${clean(item.role)} (${clean(item.period)})`,
    ),
    "",
    "## Selected work",
    "",
    ...projects.map(
      (project) =>
        `- ${project.name} — ${clean(project.blurb)} ${SITE_URL}/projects/${project.slug}${project.tags.length ? ` — ${project.tags.join(", ")}` : ""
        }`,
    ),
    "",
    "## Certifications",
    "",
    ...certifications.map(
      (item) =>
        `- ${clean(item.name)} — ${clean(item.issuer)} (${clean(item.period)})`,
    ),
    "",
    "## Community",
    "",
    ...community.map(
      (item) =>
        `- ${clean(item.programme)} — ${clean(item.role)} (${clean(item.period)})`,
    ),
    "",
    "## Elsewhere",
    "",
    ...profile.socials.map((social) => `- ${social.label}: ${social.url}`),
    "",
  ];

  const body = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return new Response(`${body}\n`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
