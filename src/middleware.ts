import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of domains to handle in middleware
const validDomains = [
  'localhost:3000',
  'localhost:3001',
  'bittybox.hiddencasa.com'
];

export function middleware(request: NextRequest) {
  // Get hostname (e.g. vercel.com, example.com)
  const hostname = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

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

  // Validate domain
  const isValidDomain = validDomains.some(domain => hostname.includes(domain));
  if (!isValidDomain) {
    console.log('Invalid domain:', hostname);
    // Redirect invalid domains to production
    return NextResponse.redirect('https://bittybox.hiddencasa.com');
  }

  // Special handling for the settings route 
  if (path === '/settings' && hostname.includes('bittybox.hiddencasa.com')) {
    // Add CORS headers to the response
    const response = NextResponse.next();
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 