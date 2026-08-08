import path from "node:path";
import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to the workspace root so the standalone bundle picks up
  // the pnpm-symlinked dependencies instead of guessing at the root.
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
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
