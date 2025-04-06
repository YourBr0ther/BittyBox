/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'i.ytimg.com'],
  },
  crossOrigin: 'anonymous',
  experimental: {
    // Allow cross-origin requests from the production domain during development
    allowedDevOrigins: [
      'https://bittybox.hiddencasa.com',
      'http://10.0.2.177:3000',
      'http://10.0.2.177',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          }
        ],
      },
      {
        // Special headers for Next.js static files
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ];
  },
  // Expose environment variables to the browser
  env: {
    NEXT_PUBLIC_YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
  // Ensure output is properly configured
  output: 'standalone',
  // Disable strict mode for production
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig; 