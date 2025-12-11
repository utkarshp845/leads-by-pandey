/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
  // Compress responses
  compress: true,
  // Production optimizations
  poweredByHeader: false,
};

module.exports = nextConfig;

