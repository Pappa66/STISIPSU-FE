import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "145.79.8.29",
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "stisipsu.ac.id",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        has: [{ type: "host", value: "(.*)" }],
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
