import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/spot/new',
        destination: '/log/new',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
