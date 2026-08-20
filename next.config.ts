import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Cloudinary-hosted media (uploads land under res.cloudinary.com).
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Existing seeded category imagery.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // A stray lockfile in the home directory makes Turbopack infer the wrong
  // workspace root, so pin it to this project.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  staticPageGenerationTimeout: 240,
};

export default withNextIntl(nextConfig);
