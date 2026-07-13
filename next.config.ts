import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // This app lives in a subfolder next to other lockfiles; pin the root so
  // Turbopack stops guessing the workspace directory.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
