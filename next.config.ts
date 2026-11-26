import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Keep the dev server's build output separate from `next build` so that a
   * production build cannot overwrite the chunks the dev server is serving. */
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  reactStrictMode: false,
};

export default nextConfig;
