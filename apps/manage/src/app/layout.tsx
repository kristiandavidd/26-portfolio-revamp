import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sedgwick_Ave_Display,
} from "next/font/google";
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
  title: "Content panel · Kristian David",
  description: "Manage the portfolio, assets and messages.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${sedgwickAveDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
