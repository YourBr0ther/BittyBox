import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { cookies } from 'next/headers';

// Add the force-static directive for static exports
export const dynamic = 'force-static';

// Generate static parameters for the [...nextauth] route
export function generateStaticParams() {
  return [
    { nextauth: ['session'] },
    { nextauth: ['signin'] },
    { nextauth: ['signout'] },
    { nextauth: ['callback', 'google'] },
    { nextauth: ['csrf'] },
    { nextauth: ['providers'] },
  ];
}

// Extend the built-in session types
interface ExtendedSession extends Session {
  accessToken?: string;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

// Extend the built-in JWT types
interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
}

// Allow multiple domains for production and development
const isProd = process.env.NODE_ENV === 'production';
const NEXTAUTH_URL = isProd 
  ? process.env.NEXTAUTH_URL_PRODUCTION || 'https://bittybox.hiddencasa.com'
  : process.env.NEXTAUTH_URL || 'http://localhost:3000';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token and refresh_token to the token
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000; // Default 1 hour
        
        // Log the scopes for debugging
        console.log('Account scopes:', account.scope);
      }
      
      // If token has not expired, return it
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      
      // Otherwise, refresh the token
      // Note: In a production app, you would implement token refresh here
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      const extendedSession = session as ExtendedSession;
      extendedSession.accessToken = token.accessToken as string;
      
      if (extendedSession.user) {
        extendedSession.user.id = token.sub;
      }
      
      return extendedSession;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects for both development and production domains
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (
        url.startsWith(baseUrl) || 
        (isProd && url.startsWith('https://bittybox.hiddencasa.com')) ||
        (!isProd && url.startsWith('http://localhost:3000'))
      ) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    // Custom sign-in page for better user experience
    signIn: '/settings',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Use secure cookies in production
  useSecureCookies: isProd,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },
});

export { handler as GET, handler as POST }; 