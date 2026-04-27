import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  allowedDevOrigins: ["10.30.140.10:3000", "localhost:3000", "10.30.140.10.nip.io:3000"],
  transpilePackages: ["@niivue/niivue"],
};

export default nextConfig;