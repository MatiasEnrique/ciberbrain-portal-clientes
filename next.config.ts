import type { NextConfig } from "next";

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["ciberbrain.net"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
} satisfies NextConfig;

module.exports = nextConfig;
