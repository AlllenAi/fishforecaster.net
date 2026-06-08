import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/images/**",
        search: "?url=*",
      },
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  redirects: async () => [
    // Redirect all non-primary domains to thefishforecaster.com
    ...[
      "fishforecaster.net",
      "www.fishforecaster.net",
      "www.thefishforecaster.com",
      "thefishforecast.com",
      "www.thefishforecast.com",
    ].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://thefishforecaster.com/:path*",
      permanent: true,
    })),
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(self)",
        },
      ],
    },
  ],
};

export default nextConfig;