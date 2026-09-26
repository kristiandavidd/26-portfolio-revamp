import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Sedgwick_Ave_Display,
} from "next/font/google";
import { BottomBar } from "@/components/layout/BottomBar";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
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
  title: "Portfolio",
  description: "Personal portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} ${sedgwickAveDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        {/* One bar holding both navs. It lives in the layout because the
            personality switch has to be reachable from every route, and the two
            only sit on the same baseline as siblings in a shared row. */}
        <BottomBar />
      </body>
    </html>
  );
}
