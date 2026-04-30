import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  allowedDevOrigins: [
    "https://10.229.193.10:3000",
    "https://10.229.193.10.nip.io:3000",
    "https://neuroscan.local:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
    "10.229.193.10:3000",
    "10.229.193.10.nip.io:3000",
    "neuroscan.local:3000",
    "https://10.229.193.10:3001",
    "https://10.229.193.10.nip.io:3001",
    "https://neuroscan.local:3001",
    "10.229.193.10:3001",
    "10.229.193.10.nip.io:3001",
    "neuroscan.local:3001",
    "https://10.229.193.10:3002",
    "https://10.229.193.10.nip.io:3002",
    "10.229.193.10:3002",
    "10.229.193.10.nip.io:3002",
    "10.229.193.10",
    "10.229.193.10.nip.io",
    "neuroscan.local"
  ],
  transpilePackages: ["@niivue/niivue"],
};

export default nextConfig;