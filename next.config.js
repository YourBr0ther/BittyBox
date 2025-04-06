/** @type {import('next').NextConfig} */
const nextConfig = {
  // Comment out static export settings
  // output: 'export',
  // distDir: 'out',
  
  // Keep images optimization for normal development 
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  
  // Don't add trailing slashes
  trailingSlash: false,
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Fix CORS issues by marking all scripts as anonymous
  crossOrigin: 'anonymous',
};

module.exports = nextConfig; 