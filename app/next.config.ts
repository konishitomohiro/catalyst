import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run 用に、実行に必要なファイルだけを .next/standalone に集める
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
