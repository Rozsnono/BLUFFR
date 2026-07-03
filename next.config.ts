import type { NextConfig } from "next";

const nextConfig = {
  // Only trigger static HTML exports when executing the Capacitor compilation command
  output: process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: true, // Required for static exports
  },
};

export default nextConfig;
