import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { YouTubeService } from '@/services/youtubeService';

// With static export, API routes aren't supported
// We'll return a static response for demonstration purposes
// In a real app, you would use client-side API calls or serverless functions

export async function GET(request: NextRequest) {
  try {
    // For testing purposes, just return a sample YouTube API response
    // In production, you would use proper authentication and API calls
    return NextResponse.json({
      status: 'success',
      data: {
        results: [
          {
            id: 'sample-id-1',
            title: 'Sample YouTube Video 1',
            thumbnail: 'https://i.ytimg.com/vi/sample-id-1/hqdefault.jpg',
            duration: '3:45'
          },
          {
            id: 'sample-id-2',
            title: 'Sample YouTube Video 2',
            thumbnail: 'https://i.ytimg.com/vi/sample-id-2/hqdefault.jpg',
            duration: '2:30'
          }
        ]
      }
    });
  } catch (error) {
    console.error('YouTube API test error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube data' },
      { status: 500 }
    );
  }
} 