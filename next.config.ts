import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/waitlist", destination: "/#hero", permanent: false },
      { source: "/sort", destination: "https://feeljoy.ai", permanent: false },
    ];
  },
};

export default nextConfig;
