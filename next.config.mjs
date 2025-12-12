/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static optimization for all pages
  experimental: {
    // This ensures all pages are dynamically rendered
  },
  // Skip static generation during build
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
