import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // RSS 썸네일만 허용 (src/lib/sources.ts의 imagePrefix와 맞춘다)
    remotePatterns: [
      new URL("https://media.wired.com/photos/**"),
      new URL("https://platform.theverge.com/wp-content/uploads/**"),
    ],
    qualities: [75],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
