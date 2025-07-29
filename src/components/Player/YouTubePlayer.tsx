'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useSession } from 'next-auth/react';
import { YouTubeService } from '@/services/youtubeService';

// Load YouTube iframe API
const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT) {
      resolve();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
};

interface YouTubePlayerProps {
  videoId: string;
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
  onReady?: () => void;
  autoplay?: boolean;
}

// YouTube API types
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

interface YouTubeEvent {
  data: number;
}

// Add YouTube API types
declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLElement, config: any) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// Define player handle type for ref
export interface YouTubePlayerHandle {
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(({
  videoId,
  onStateChange,
  onError,
  onReady,
  autoplay = true,
}, ref) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerElementRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const { data: session } = useSession();

  // Expose player methods via ref
  useImperativeHandle(ref, () => ({
    playVideo: () => {
      if (playerRef.current && isReady) {
        playerRef.current.playVideo();
      }
    },
    pauseVideo: () => {
      if (playerRef.current && isReady) {
        playerRef.current.pauseVideo();
      }
    },
    getCurrentTime: () => {
      if (playerRef.current && isReady) {
        return playerRef.current.getCurrentTime() || 0;
      }
      return 0;
    },
    getDuration: () => {
      if (playerRef.current && isReady) {
        return playerRef.current.getDuration() || 0;
      }
      return 0;
    }
  }));

  // Initialize the player
  useEffect(() => {
    // Skip initialization if no videoId provided
    if (!videoId) return;
    
    let isMounted = true;
    
    const initPlayer = async () => {
      try {
        await loadYouTubeAPI();

        if (!isMounted || !playerElementRef.current || !window.YT) return;
        
        // Destroy any existing player
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        playerRef.current = new window.YT.Player(playerElementRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            // Auto-play if specified
            autoplay: autoplay ? 1 : 0,
            // Controls on mobile need to be enabled
            controls: 1,
            // Disable keyboard controls for safety
            disablekb: 1,
            // Enable modest branding (smaller YouTube logo)
            modestbranding: 1,
            // Disable related videos at the end
            rel: 0,
            // For Premium accounts, disable ads 
            iv_load_policy: 3,
            // Disable full-screen
            fs: 0,
          },
          events: {
            onReady: () => {
              if (!isMounted) return;
              setIsReady(true);
              if (onReady) onReady();
            },
            onStateChange: (event: YouTubeEvent) => {
              if (!isMounted) return;
              if (onStateChange) onStateChange(event.data);
            },
            onError: (event: YouTubeEvent) => {
              if (!isMounted) return;
              if (onError) onError(event.data);
            },
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player:', e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId]); // Only reinitialize when videoId changes

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      <div
        className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
        ref={playerElementRef}
      />
      {!isReady && (
        <div className="absolute inset-0 bg-pink-light/50 flex items-center justify-center rounded-xl">
          <div className="w-12 h-12 border-4 border-pink-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer; 