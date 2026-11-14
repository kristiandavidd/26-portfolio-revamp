import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { BottomBar } from "@/components/layout/BottomBar";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { getContent, getSettings } from "@/lib/content";
import { EXPERTISE, JOB_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const axion = localFont({
  src: "./fonts/font_axion.ttf",
  variable: "--font-axion",
  weight: "400",
  display: "swap",
});

// Every page reads content from the database, so the segment is rendered per
// request. That way a change made in the panel is live without a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile, settings } = await getContent();
  const general = await getSettings();
  const role = profile.role.trim() || JOB_TITLE;
  const siteUrl = settings.siteUrl || SITE_URL;
  const description =
    settings.siteDescription ||
    `Portfolio of ${profile.name}, a ${role.toLowerCase()} in ${profile.location}. Laravel, Next.js and React systems for loyalty, ticketing, tournaments and IoT.`;
  const portrait = profile.heroPortraitUrl;

  const keywords = [
    profile.name,
    ...(profile.fullName && profile.fullName !== profile.name
      ? [profile.fullName]
      : []),
    `${profile.name} portfolio`,
    `${profile.name} software engineer`,
    role,
    "Fullstack Web Developer",
    "Software Engineer Semarang",
    "Laravel developer",
    "Next.js developer",
    "React developer",
    "TypeScript developer",
    "IoT developer",
    "Dephilia",
    ...(profile.location ? [profile.location] : []),
  ];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} · ${role}`,
      template: `%s · ${profile.name}`,
    },
    description,
    applicationName: `${profile.name} · ${role}`,
    keywords,
    authors: [{ name: profile.name, url: siteUrl }],
    creator: profile.name,
    publisher: profile.name,
    category: "technology",
    icons: { icon: general.favicons.portfolio ?? "/favicon.ico" },
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "profile",
      siteName: `${profile.name} · ${role}`,
      title: `${profile.name} · ${role}`,
      description,
      url: "/",
      locale: "en_US",
      images: portrait
        ? [
          {
            url: portrait,
            width: profile.heroPortraitWidth ?? undefined,
            height: profile.heroPortraitHeight ?? undefined,
            alt: `${profile.name}, ${role}`,
          },
        ]
        : undefined,
    },
    twitter: {
      card: portrait ? "summary_large_image" : "summary",
      title: `${profile.name} · ${role}`,
      description,
      images: portrait ? [portrait] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, settings, experience, projects, dephilia } =
    await getContent();
  const general = await getSettings();

  const role = profile.role.trim() || JOB_TITLE;
  const siteUrl = (settings.siteUrl || SITE_URL).replace(/\/$/, "");
  const personId = `${siteUrl}/#person`;
  const description = settings.siteDescription || profile.bio;
  const currentCompany = experience.find((item) => item.current)?.company;
  const sameAs = profile.socials
    .map((social) => social.url)
    .filter((url) => url.replace(/\/$/, "") !== siteUrl);

  // One @graph rather than loose objects, so the person, the site and the
  // company resolve to a single entity for search engine and answer engine.
  const graph = [
    {
      "@type": "Person",
      "@id": personId,
      name: profile.name,
      ...(profile.fullName && profile.fullName !== profile.name
        ? { alternateName: profile.fullName }
        : {}),
      jobTitle: role,
      description: profile.bio || description,
      url: siteUrl,
      ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
      ...(profile.heroPortraitUrl ? { image: profile.heroPortraitUrl } : {}),
      ...(profile.location
        ? { homeLocation: { "@type": "Place", name: profile.location } }
        : {}),
      ...(currentCompany
        ? { worksFor: { "@type": "Organization", name: currentCompany } }
        : {}),
      hasOccupation: {
        "@type": "Occupation",
        name: role,
        skills: EXPERTISE.join(", "),
      },
      knowsAbout: EXPERTISE,
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: settings.siteTitle || `${profile.name} · ${role}`,
      description,
      inLanguage: "en",
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: `${profile.name} · ${role}`,
      description,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": personId },
      mainEntity: { "@id": personId },
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#dephilia`,
      name: dephilia.name,
      legalName: dephilia.legalName || undefined,
      url: dephilia.url,
      description: dephilia.description,
      founder: { "@id": personId },
    },
    ...(projects.length > 0
      ? [
        {
          "@type": "ItemList",
          "@id": `${siteUrl}/#work`,
          name: `Selected work by ${profile.name}`,
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "CreativeWork",
              name: project.name,
              url: `${siteUrl}/projects/${project.slug}`,
              description: project.blurb,
              ...(project.tags.length > 0
                ? { keywords: project.tags.join(", ") }
                : {}),
              creator: { "@id": personId },
            },
          })),
        },
      ]
      : []),
  ];

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${axion.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": graph,
            }).replace(/</g, "\\u003c"),
          }}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <BottomBar musicUrl={general.music?.url ?? null} />
      </body>
    </html>
  );
}
