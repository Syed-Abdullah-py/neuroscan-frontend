import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // Increased for large medical file uploads
    },
  },
};

export default nextConfig;
