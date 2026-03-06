import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  turbopack: {
    root: __dirname,
  },

  images: {
    // This allows using <Image /> with external URLs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // adjust this for tighter security
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
