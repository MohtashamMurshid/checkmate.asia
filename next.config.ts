
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Externalize packages that use native Node.js modules
  // This works for both webpack and Turbopack
  serverExternalPackages: [
    'canvas',
    'jsdom',
    '@tobyg74/tiktok-api-dl',
  ],
  // Add empty turbopack config to silence the warning
  // The serverExternalPackages above will handle externalization for both bundlers
  turbopack: {},
};

export default nextConfig;
