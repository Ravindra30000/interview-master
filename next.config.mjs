/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker/Cloud Run
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;




