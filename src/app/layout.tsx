import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sedgwick_Ave_Display,
} from "next/font/google";
import { BottomBar } from "@/components/layout/BottomBar";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { profile } from "@/data/profile";
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

/**
 * Taken from the website listed among the socials, and used as the base so every
 * URL in the metadata below can stay relative. Confirm it before shipping: if
 * the site lives on another domain, this is the one line to change.
 */
const SITE_URL = "https://kristiandav.id";
const JOB_TITLE = "Fullstack Software Engineer";

const DESCRIPTION =
  "Portfolio of Kristian David, a fullstack software engineer in Semarang, Indonesia. Laravel, Next.js and React systems for loyalty, ticketing, tournaments and IoT.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // The name leads, because the name is what gets searched. Child routes set
  // their own titles and carry the name after theirs.
  title: `${profile.name} · ${JOB_TITLE}`,
  description: DESCRIPTION,
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
  // No canonical here on purpose: a canonical declared in the layout is inherited
  // by every route, which would point each case page at the home page and take
  // them out of the index. Left unset, every page canonicalises itself.
  openGraph: {
    type: "profile",
    siteName: `${profile.name} · ${JOB_TITLE}`,
    title: `${profile.name} · ${JOB_TITLE}`,
    description: DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${profile.name} · ${JOB_TITLE}`,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

/**
 * Structured data for the person behind the site, so search engines and AI
 * assistants can resolve "Kristian David" to this page rather than guessing from
 * the prose. Everything that exists as data is read from it, so the two cannot
 * drift apart.
 */
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: JOB_TITLE,
  description: profile.bio,
  // Absolute, unlike the metadata fields above: nothing resolves relative URLs
  // for structured data.
  url: SITE_URL,
  email: `mailto:${profile.email}`,
  homeLocation: { "@type": "Place", name: profile.location },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
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
        {/* One bar holding both navs. It lives in the layout because the
            personality switch has to be reachable from every route, and the two
            only sit on the same baseline as siblings in a shared row. */}
        <BottomBar />
      </body>
    </html>
  );
}
