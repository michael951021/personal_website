import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Work write-ups now live under /writing; keep old links working.
  async redirects() {
    return [
      { source: '/work', destination: '/writing', permanent: true },
      { source: '/work/:slug', destination: '/writing/:slug', permanent: true },
    ]
  },
};

export default nextConfig;
