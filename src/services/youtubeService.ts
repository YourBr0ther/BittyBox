import { getSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Extend the built-in session types
interface ExtendedSession extends Session {
  accessToken?: string;
}

interface Song {
  id: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  videoId: string;
}

interface Playlist {
  id: string;
  name: string;
  icon: string;
  url: string;
  songs?: Song[];
}

// Store for local caching
const playlistCache = new Map<string, Playlist>();
const songCache = new Map<string, Song[]>();

// YouTube API configuration
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const DEFAULT_ICONS = ['star', 'heart', 'magic', 'cat', 'dog', 'icecream'];

// Helper to extract playlist ID from YouTube URL
const extractPlaylistId = (url: string): string | null => {
  const regex = /(?:list=)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * YouTube Service for handling playlist and song interactions
 * Uses the YouTube Data API with authentication
 */
export const YouTubeService = {
  /**
   * Get authenticated API headers
   */
  getAuthHeaders: async (): Promise<HeadersInit> => {
    const session = await getSession() as ExtendedSession | null;
    
    if (!session?.accessToken) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    };
  },
  
  /**
   * Get default API headers with API key
   */
  getDefaultHeaders: (): HeadersInit => {
    return {
      'Content-Type': 'application/json',
    };
  },
  
  /**
   * Make authenticated API request to YouTube
   */
  fetchFromYouTube: async (endpoint: string, authenticated: boolean = true): Promise<any> => {
    let apiKey = '';
    
    if (!authenticated) {
      apiKey = `&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ''}`;
    }
    
    const headers = authenticated 
      ? await YouTubeService.getAuthHeaders() 
      : YouTubeService.getDefaultHeaders();
    
    const response = await fetch(`${YOUTUBE_API_BASE}${endpoint}${apiKey}`, {
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`YouTube API error: ${errorData.error?.message || response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get user's playlists from YouTube
   */
  getPlaylists: async (): Promise<Playlist[]> => {
    try {
      // Try to fetch authenticated playlists
      const data = await YouTubeService.fetchFromYouTube(
        '/playlists?part=snippet&mine=true&maxResults=50'
      );
      
      const playlists: Playlist[] = data.items.map((item: any, index: number) => {
        const playlist: Playlist = {
          id: item.id,
          name: item.snippet.title,
          icon: DEFAULT_ICONS[index % DEFAULT_ICONS.length],
          url: `https://www.youtube.com/playlist?list=${item.id}`,
        };
        
        // Cache the playlist
        playlistCache.set(item.id, playlist);
        
        return playlist;
      });
      
      return playlists;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      
      // If authenticated request fails or no session, use local storage or fallback
      const storedPlaylists = localStorage.getItem('bittybox_playlists');
      return storedPlaylists ? JSON.parse(storedPlaylists) : [];
    }
  },
  
  /**
   * Get a specific playlist by ID
   */
  getPlaylistById: async (id: string): Promise<Playlist | null> => {
    // Check cache first
    if (playlistCache.has(id)) {
      return playlistCache.get(id) || null;
    }
    
    try {
      const data = await YouTubeService.fetchFromYouTube(
        `/playlists?part=snippet&id=${id}`
      );
      
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const playlist: Playlist = {
          id: item.id,
          name: item.snippet.title,
          icon: DEFAULT_ICONS[0],
          url: `https://www.youtube.com/playlist?list=${item.id}`,
        };
        
        // Cache the playlist
        playlistCache.set(id, playlist);
        
        return playlist;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching playlist ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Get songs for a specific playlist
   */
  getSongsForPlaylist: async (playlistId: string): Promise<Song[]> => {
    // Check cache first
    if (songCache.has(playlistId)) {
      return songCache.get(playlistId) || [];
    }
    
    try {
      const data = await YouTubeService.fetchFromYouTube(
        `/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}`
      );
      
      const songs: Song[] = data.items.map((item: any, index: number) => {
        const song: Song = {
          id: item.id,
          title: item.snippet.title,
          artist: item.snippet.videoOwnerChannelTitle || 'Unknown Artist',
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          videoId: item.snippet.resourceId.videoId,
        };
        
        return song;
      });
      
      // Cache the songs
      songCache.set(playlistId, songs);
      
      return songs;
    } catch (error) {
      console.error(`Error fetching songs for playlist ${playlistId}:`, error);
      return [];
    }
  },

  /**
   * Import playlists from a CSV file
   * Format: name,url,icon
   */
  importPlaylistsFromCSV: async (csvContent: string): Promise<Playlist[]> => {
    const lines = csvContent.split('\n');
    const playlists: Playlist[] = [];
    const existingPlaylists = await YouTubeService.getPlaylists();
    const existingIds = new Set(existingPlaylists.map(p => p.id));
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [name, url, icon] = line.split(',').map(item => item.trim());
      
      if (name && url) {
        const playlistId = extractPlaylistId(url);
        
        if (!playlistId) {
          console.warn(`Invalid YouTube playlist URL: ${url}`);
          continue;
        }
        
        // Skip if already in the list
        if (existingIds.has(playlistId)) {
          continue;
        }
        
        try {
          // Verify the playlist exists and get its details
          const playlistData = await YouTubeService.fetchFromYouTube(
            `/playlists?part=snippet&id=${playlistId}`,
            false // Use API key instead of auth
          );
          
          if (playlistData.items && playlistData.items.length > 0) {
            const playlist: Playlist = {
              id: playlistId,
              name: name || playlistData.items[0].snippet.title,
              icon: icon || DEFAULT_ICONS[Math.floor(Math.random() * DEFAULT_ICONS.length)],
              url: url,
            };
            
            playlists.push(playlist);
            playlistCache.set(playlistId, playlist);
          }
        } catch (error) {
          console.error(`Error importing playlist ${playlistId}:`, error);
        }
      }
    }
    
    // Save to local storage for offline use
    const allPlaylists = [...existingPlaylists, ...playlists];
    localStorage.setItem('bittybox_playlists', JSON.stringify(allPlaylists));
    
    return playlists;
  },
  
  /**
   * Load a YouTube video for playback
   */
  playSong: async (videoId: string): Promise<void> => {
    console.log(`Playing video ID: ${videoId}`);
    // This will be implemented in the YouTube player component
  },
};

export type { Song, Playlist }; 