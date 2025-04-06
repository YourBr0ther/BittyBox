import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { YouTubeService } from '@/services/youtubeService';

export async function GET(req: NextRequest) {
  try {
    // Try to get playlists with API key first
    const apiKeyUrl = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=5';
    const apiKeyResponse = await fetch(`${apiKeyUrl}&key=${process.env.YOUTUBE_API_KEY}`);
    const apiKeyData = await apiKeyResponse.json();
    
    // Try authenticated route
    let authData = null;
    let sessionData = null;
    try {
      const session = await getServerSession();
      sessionData = session;
      
      // Only attempt if we have a session
      if (session) {
        // Try directly fetching from YouTube Data API with token
        const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=5', {
          headers: {
            'Authorization': `Bearer ${(session as any).accessToken}`,
          },
        });
        
        authData = await response.json();
      }
    } catch (authError) {
      console.error('Auth request error:', authError);
    }
    
    // Get data from our service function
    let serviceData = null;
    try {
      serviceData = await YouTubeService.getPlaylists();
    } catch (serviceError) {
      console.error('Service error:', serviceError);
    }
    
    return NextResponse.json({
      success: true,
      apiKey: {
        success: !apiKeyData.error,
        data: apiKeyData,
      },
      auth: {
        success: !authData?.error,
        data: authData,
      },
      session: sessionData,
      service: {
        success: serviceData && serviceData.length > 0,
        data: serviceData,
      },
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    }, { status: 500 });
  }
} 