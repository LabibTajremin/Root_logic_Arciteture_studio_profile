import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // typedRoutes is re-enabled in the admin phase once every route exists; enabling it
  // now would reject links to pages built in later phases.
};

export default nextConfig;
