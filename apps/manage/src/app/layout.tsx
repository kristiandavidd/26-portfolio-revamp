import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { getGeneralSettings } from "@repo/db";
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
  const general = await getGeneralSettings().catch(() => null);

  return {
    title: "Content panel · Kristian David",
    description: "Manage the portfolio, assets and messages.",
    robots: { index: false, follow: false },
    icons: { icon: general?.favicons.manage ?? "/favicon.ico" },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${axion.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
