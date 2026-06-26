import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep the legacy Pastel Finance Tracker (see docs/DECISIONS.md ADR-0001)
  // out of the Next.js build/lint surface.
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
