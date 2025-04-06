/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com', 'i.ytimg.com', 'img.youtube.com'],
  },
  experimental: {
    // Enable App Router
    appDir: true,
  },
};

module.exports = nextConfig; 