import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_CONVEX_URL?.replace("https://", "") ?? "",
        port: "",
        pathname: "/api/storage/**",
      },
    ],
  },
  outputFileTracingRoot: path.join(__dirname, '../../')
};

export default nextConfig;
