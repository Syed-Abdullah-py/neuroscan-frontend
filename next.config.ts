import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  // Allow Route Handlers to receive large MRI scan bodies (individual files up to 500MB)
  api: {
    bodyParser: {
      sizeLimit: "500mb",
    },
    responseLimit: "500mb",
  },
  transpilePackages: ["@niivue/niivue"],
};

export default nextConfig;