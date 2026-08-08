import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "mapcn-rn.b-cdn.net",
      },
    ],
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
