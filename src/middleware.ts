import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of domains to handle in middleware
const validDomains = [
  'localhost:3000',
  'localhost:3001',
  '10.0.2.177:3000',
  '10.0.2.177:3001',
  'bittybox.hiddencasa.com'
];

export function middleware(request: NextRequest) {
  // Get hostname and path
  const hostname = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;
  
  // Skip middleware in static export mode
  if (process.env.NEXT_PHASE === 'phase-export') {
    return NextResponse.next();
  }
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
      },
    });
  }
  
  // Handle static routes in production
  if (process.env.NODE_ENV === 'production') {
    // Add CORS headers to all responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  }
  
  // For development server:
  
  // Check for _next/static resources loading from production domain to local host
  const isNextStaticRequest = path.includes('/_next/static') || path.includes('/_next/webpack-hmr');
  const isProductionDomainRequest = hostname.includes('bittybox.hiddencasa.com');
  
  if (isNextStaticRequest && isProductionDomainRequest) {
    // For production domain requesting static assets from local dev, redirect to public fallback
    if (path.includes('settings/page.js')) {
      return NextResponse.redirect(`${request.nextUrl.origin}/loading-fallback.html`);
    }
  }
  
  // Validate domain
  const isValidDomain = validDomains.some(domain => hostname.includes(domain));
  if (!isValidDomain) {
    console.log('Invalid domain:', hostname);
    // Redirect invalid domains to production
    return NextResponse.redirect('https://bittybox.hiddencasa.com');
  }
  
  // Special handling for the settings route 
  if (path === '/settings') {
    const response = NextResponse.next();
    
    // Add CORS headers to all responses
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  // Add CORS headers to all responses
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static/images (static images)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static/images|favicon.ico).*)',
  ],
}; 