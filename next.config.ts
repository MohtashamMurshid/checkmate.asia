import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark packages as server-only to prevent client-side bundling
  serverExternalPackages: [
    'canvas',
    '@tobyg74/tiktok-api-dl',
    '@the-convocation/twitter-scraper',
    'pdf-parse',
  ],
  
  // Turbopack config (Next.js 16+)
  turbopack: {},
  
  // Webpack config for fallback
  webpack: (config, { isServer }) => {
    // Exclude canvas from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
