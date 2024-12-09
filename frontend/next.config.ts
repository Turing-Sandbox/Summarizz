import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
