import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { PersonalNav } from "@/components/layout/PersonalNav";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { getContent, getSettings } from "@/lib/content";
import { PERSON_ID, PERSONAL_URL, PORTFOLIO_URL } from "@/lib/seo";
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

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const general = await getSettings();
  const portrait = profile.portrait?.url;
  const description =
    "Stories, places, photographs and things still to do — the other side of Kristian David.";
  const title = profile.name || "Kristian David";

  return {
    metadataBase: new URL(PERSONAL_URL),
    title: {
      default: title,
      template: `%s · ${profile.name}`,
    },
    description,
    applicationName: title,
    keywords: [
      profile.name,
      `${profile.name} personal site`,
      `${profile.name} story`,
      `${profile.name} travels`,
      "personal notebook",
      "software engineer Semarang",
    ],
    authors: [{ name: profile.name, url: PORTFOLIO_URL }],
    creator: profile.name,
    icons: { icon: general.favicons.personal ?? "/favicon.ico" },
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
      },
    },
    openGraph: {
      type: "profile",
      siteName: title,
      title,
      description,
      url: "/",
      locale: "en_US",
      images: portrait
        ? [{ url: portrait, alt: profile.name }]
        : undefined,
    },
    twitter: {
      card: portrait ? "summary_large_image" : "summary",
      title,
      description,
      images: portrait ? [portrait] : undefined,
    },
  };
}

// Everything on this side comes from the database, so it renders per request.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getContent();
  const general = await getSettings();

  // The person entity is declared in full on the portfolio; this graph points at
  // it so the two sites reinforce one identity instead of splitting it.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: profile.name,
        url: PORTFOLIO_URL,
        ...(profile.headline ? { jobTitle: profile.headline } : {}),
        ...(profile.location
          ? { homeLocation: { "@type": "Place", name: profile.location } }
          : {}),
        ...(profile.portrait ? { image: profile.portrait.url } : {}),
        ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${PERSONAL_URL}/#website`,
        url: PERSONAL_URL,
        name: profile.name,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": `${PERSONAL_URL}/#webpage`,
        url: PERSONAL_URL,
        name: profile.name,
        isPartOf: { "@id": `${PERSONAL_URL}/#website` },
        about: { "@id": PERSON_ID },
        mainEntity: { "@id": PERSON_ID },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${axion.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <PersonalNav musicUrl={general.music?.url ?? null} />
      </body>
    </html>
  );
}
