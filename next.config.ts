import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/dashboard/help-support",
        destination: "/student/dashboard/help-support",
      },
    ];
  },
};

export default nextConfig;
