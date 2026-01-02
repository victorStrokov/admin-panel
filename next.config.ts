import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,

  typedRoutes: false,

  experimental: {
    ppr: false, // ← ключевой фикс
    cacheComponents: false,
  },

  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  turbopack: {},
};

export default nextConfig;
