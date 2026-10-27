import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sedgwick_Ave_Display,
} from "next/font/google";
import { PersonalNav } from "@/components/layout/PersonalNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
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

export const metadata: Metadata = {
  title: "The personal side · Kristian David",
  description:
    "Stories, places, photographs and things still to do — the personal side of Kristian David.",
  robots: { index: false, follow: false },
};

// Everything on this side comes from the database, so it renders per request.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getContent();

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${sedgwickAveDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        <SmoothScrollProvider>
          {children}
          <SiteFooter name={profile.name} email={profile.email} />
        </SmoothScrollProvider>
        <PersonalNav />
      </body>
    </html>
  );
}
