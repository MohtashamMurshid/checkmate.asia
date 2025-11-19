import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize packages that use native Node.js modules
  // This works for both webpack and Turbopack
  serverExternalPackages: [
    'canvas',
    'jsdom',
    '@tobyg74/tiktok-api-dl',
  ],
};

export default nextConfig;
