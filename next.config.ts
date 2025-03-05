import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Needed for static images
  },
  basePath: "/math-game", // Ensures correct routing on GitHub Pages
  assetPrefix: "/math-game/", // Fixes static asset paths
};

export default nextConfig;
