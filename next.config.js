/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make site deployable to GitHub Pages and other static hosts
  output: 'export',
  distDir: 'out',
  
  // Needed for static export with images
  images: {
    unoptimized: true,
  },
  
  // Don't add trailing slashes
  trailingSlash: false,
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Fix CORS issues by marking all scripts as anonymous
  crossOrigin: 'anonymous',
};

module.exports = nextConfig; 