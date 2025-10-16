import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    // !! WARN !!
    // This allows your app to build even if it has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
