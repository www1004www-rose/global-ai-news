import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 서버(Vercel) 배포에 data/ 폴더를 함께 넣는다. 페이지가 런타임에 파일로 읽기 때문이다.
  outputFileTracingIncludes: {
    "/*": ["./data/**/*.json"],
  },
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
