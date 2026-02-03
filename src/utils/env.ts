/**
 * Environment utility functions
 * These help manage environment-specific configurations
 */

export const isProd = process.env.NODE_ENV === 'production';

/**
 * Get the base URL for the application
 * Uses the production URL in production, and localhost in development
 */
export const getBaseUrl = (): string => {
  if (isProd) {
    return process.env.NEXT_PUBLIC_APP_URL_PRODUCTION || 'https://bittybox.hiddencasa.com';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

/**
 * Get the NextAuth URL for authentication
 * Uses the production URL in production, and localhost in development
 */
export const getAuthUrl = (): string => {
  if (isProd) {
    return process.env.NEXTAUTH_URL_PRODUCTION || 'https://bittybox.hiddencasa.com';
  }
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

/**
 * Get absolute URL with the correct domain based on environment
 * @param path Path to append to the base URL
 */
export const getAbsoluteUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Environment variables for Home Assistant, NanoGPT, and admin settings
 */
export const env = {
  homeAssistantUrl: process.env.HOME_ASSISTANT_URL || '',
  homeAssistantToken: process.env.HOME_ASSISTANT_TOKEN || '',
  homeAssistantSpeaker: process.env.HOME_ASSISTANT_SPEAKER || 'media_player.kid_room_speaker',
  nanoGptApiKey: process.env.NANOGPT_API_KEY || '',
  adminPin: process.env.ADMIN_PIN || '1234',
}; 