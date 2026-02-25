import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/sort", destination: "/#sort", permanent: false },
      { source: "/waitlist", destination: "/#hero", permanent: false },
    ];
  },
};

export default nextConfig;
