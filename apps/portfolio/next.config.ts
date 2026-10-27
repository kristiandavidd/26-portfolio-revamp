import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  // The workspace packages and Prisma engine live above the app folder. Tracing
  // from the repo root makes sure Vercel bundles them with the functions.
  outputFileTracingRoot: resolve(process.cwd(), "../.."),
  images: {
    // Every image is served by Silos, which hands back a CDN URL.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dephilia.com",
      },
    ],
    qualities: [72, 75, 80, 90],
  },
};

export default nextConfig;
