import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { YouTubeService } from '@/services/youtubeService';

// With static export, API routes aren't supported
// We'll return a static response for demonstration purposes
// In a real app, you would use client-side API calls or serverless functions

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json({
    message: "This is a static API response. For dynamic API functionality, please use client-side API calls, serverless functions, or deploy with a different Next.js output mode.",
    timestamp: new Date().toISOString(),
  });
} 