import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/waitlist", destination: "/#hero", permanent: false },
    ];
  },
};

export default nextConfig;
