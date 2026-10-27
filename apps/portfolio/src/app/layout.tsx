import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sedgwick_Ave_Display,
} from "next/font/google";
import { BottomBar } from "@/components/layout/BottomBar";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { getContent } from "@/lib/content";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const sedgwickAveDisplay = Sedgwick_Ave_Display({
  variable: "--font-sedgwick-ave-display",
  subsets: ["latin"],
  weight: "400",
});

const JOB_TITLE = "Fullstack Software Engineer";

// Every page reads content from the database, so the segment is rendered per
// request. That way a change made in the panel is live without a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile, settings } = await getContent();
  const description =
    settings.siteDescription ||
    `Portfolio of ${profile.name}, a fullstack software engineer in Semarang, Indonesia.`;

  return {
    metadataBase: new URL(settings.siteUrl),
    title: `${profile.name} · ${JOB_TITLE}`,
    description,
    keywords: [
      profile.name,
      "fullstack software engineer",
      "software engineer Semarang",
      "Laravel developer",
      "Next.js developer",
      "React developer",
      "portfolio",
    ],
    authors: [{ name: profile.name, url: "/" }],
    creator: profile.name,
    openGraph: {
      type: "profile",
      siteName: `${profile.name} · ${JOB_TITLE}`,
      title: `${profile.name} · ${JOB_TITLE}`,
      description,
      url: "/",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: `${profile.name} · ${JOB_TITLE}`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, settings } = await getContent();

  // Structured data, so search engines and assistants resolve the name to this
  // page. Read from the same content the page renders, so the two cannot drift.
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: JOB_TITLE,
    description: profile.bio,
    url: settings.siteUrl,
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    ...(profile.location
      ? { homeLocation: { "@type": "Place", name: profile.location } }
      : {}),
    knowsAbout: [
      "Laravel",
      "Next.js",
      "React",
      "TypeScript",
      "IoT",
      "Cloud computing",
    ],
    sameAs: profile.socials.map((social) => social.url),
  };

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${sedgwickAveDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person).replace(/</g, "\\u003c"),
          }}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <BottomBar />
      </body>
    </html>
  );
}
