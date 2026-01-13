import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,

  productionBrowserSourceMaps: false,

  typedRoutes: false,

  experimental: {
    ppr: false,
  },

  cacheComponents: false,

  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  turbopack: {},
};

export default nextConfig;
