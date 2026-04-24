import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  transpilePackages: ["@niivue/niivue"],
};

export default nextConfig;