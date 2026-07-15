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
      {
        protocol: "https",
        hostname: "stisipsu-be.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/?$/, '/'),
  },
};

export default nextConfig;
