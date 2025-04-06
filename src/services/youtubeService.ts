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

// Mock data until we implement the actual YouTube API integration
const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Kids Songs',
    thumbnail: 'https://via.placeholder.com/300/FF6B9D/FFFFFF?text=✨',
    videoId: 'yCjJyiqpAuU',
  },
  {
    id: '2',
    title: 'The Wheels on the Bus',
    artist: 'Kids Songs',
    thumbnail: 'https://via.placeholder.com/300/FFB5D4/FFFFFF?text=🚌',
    videoId: 'HP-MbfQ9K9o',
  },
  {
    id: '3',
    title: 'Old MacDonald Had a Farm',
    artist: 'Kids Songs',
    thumbnail: 'https://via.placeholder.com/300/FF3A7A/FFFFFF?text=🐄',
    videoId: 'LIWbUjHZFTw',
  },
];

// Mock data for playlists
const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: '1',
    name: 'Favorite Songs',
    icon: 'star',
    url: 'https://www.youtube.com/playlist?list=sample1',
    songs: MOCK_SONGS,
  },
  {
    id: '2',
    name: 'Animal Songs',
    icon: 'cat',
    url: 'https://www.youtube.com/playlist?list=sample2',
    songs: MOCK_SONGS,
  },
  {
    id: '3',
    name: 'Bedtime Songs',
    icon: 'heart',
    url: 'https://www.youtube.com/playlist?list=sample3',
    songs: MOCK_SONGS,
  },
];

/**
 * YouTube Service for handling playlist and song interactions
 * This is a mock service until the YouTube API integration is complete
 */
export const YouTubeService = {
  /**
   * Get all available playlists
   */
  getPlaylists: async (): Promise<Playlist[]> => {
    // In the future, we'll fetch from local storage or YouTube API
    return MOCK_PLAYLISTS;
  },
  
  /**
   * Get a specific playlist by ID
   */
  getPlaylistById: async (id: string): Promise<Playlist | null> => {
    const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
    return playlist || null;
  },
  
  /**
   * Get songs for a specific playlist
   */
  getSongsForPlaylist: async (playlistId: string): Promise<Song[]> => {
    const playlist = MOCK_PLAYLISTS.find(p => p.id === playlistId);
    return playlist?.songs || [];
  },

  /**
   * Import playlists from a CSV file
   * Format: name,url,icon
   */
  importPlaylistsFromCSV: async (csvContent: string): Promise<Playlist[]> => {
    const lines = csvContent.split('\n');
    const playlists: Playlist[] = [];
    
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      const [name, url, icon] = line.split(',').map(item => item.trim());
      
      if (name && url) {
        playlists.push({
          id: `imported-${index}`,
          name,
          url,
          icon: icon || 'star',
        });
      }
    });
    
    // In the future, we'll save to local storage
    return playlists;
  },
  
  /**
   * Play a YouTube video (placeholder for now)
   */
  playSong: async (videoId: string): Promise<void> => {
    console.log(`Playing video ID: ${videoId}`);
    // In the future, this will control the YouTube player
  },
};

export type { Song, Playlist }; 