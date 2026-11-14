import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: resolve(process.cwd(), "../.."),
  experimental: {
    serverActions: {
      // Artwork is uploaded through the same form that saves a section, and
      // hero plates are routinely larger than the 1 MB default. Silos itself
      // takes bigger files through its presigned route, so this is the only
      // ceiling left.
      bodySizeLimit: "32mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dephilia.com",
      },
    ],
    qualities: [75, 90],
  },
};

export default nextConfig;
