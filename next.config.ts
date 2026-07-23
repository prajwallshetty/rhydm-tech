import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Turbopack infer the wrong
  // workspace root, so pin it to this project.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default withNextIntl(nextConfig);
