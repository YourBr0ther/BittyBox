'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';
import YouTubePlayer from './YouTubePlayer';
import { YouTubeService } from '@/services/youtubeService';

interface MusicPlayerProps {
  currentSong?: {
    title: string;
    artist?: string;
    thumbnail?: string;
    videoId: string;
  };
  nextSong?: {
    title: string;
    artist?: string;
  };
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

// YouTube player states
enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export default function MusicPlayer({
  currentSong = { title: 'No song selected', videoId: '' },
  nextSong = { title: 'No upcoming songs' },
  onPlay = () => {},
  onPause = () => {},
  onNext = () => {},
  onPrevious = () => {},
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // Handle player state changes
  const handlePlayerStateChange = (state: number) => {
    switch (state) {
      case PlayerState.PLAYING:
        setIsPlaying(true);
        startProgressTracker();
        break;
      case PlayerState.PAUSED:
        setIsPlaying(false);
        stopProgressTracker();
        break;
      case PlayerState.ENDED:
        setIsPlaying(false);
        stopProgressTracker();
        setProgress(0);
        onNext(); // Auto-play next song
        break;
      default:
        break;
    }
  };
  
  const handlePlayerReady = () => {
    setPlayerReady(true);
    YouTubeService.playSong(currentSong.videoId);
  };
  
  const handlePlayerError = (error: number) => {
    console.error('YouTube player error:', error);
    // Handle error (maybe try next song)
    if (error === 150 || error === 100) {
      // Video not available, try next
      setTimeout(onNext, 1000);
    }
  };
  
  const startProgressTracker = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const player = playerRef.current;
        const duration = player.getDuration ? player.getDuration() : 0;
        const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
        
        if (duration > 0) {
          const progressPercent = (currentTime / duration) * 100;
          setProgress(progressPercent);
        }
      }
    }, 1000);
  };
  
  const stopProgressTracker = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };
  
  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        onPause();
      } else {
        playerRef.current.playVideo();
        onPlay();
      }
    } else {
      // Fallback if player ref not available
      if (isPlaying) {
        onPause();
      } else {
        onPlay();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div className="card w-full max-w-lg mx-auto p-6">
      <div className="flex flex-col items-center">
        {currentSong.videoId ? (
          <div className="w-full mb-4">
            <YouTubePlayer
              videoId={currentSong.videoId}
              onStateChange={handlePlayerStateChange}
              onError={handlePlayerError}
              onReady={handlePlayerReady}
              autoplay={true}
              ref={playerRef}
            />
          </div>
        ) : (
          <div className="w-48 h-48 rounded-xl bg-pink-light flex items-center justify-center mb-4">
            <span className="text-pink-primary text-5xl">🎵</span>
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-pink-accent mb-1">
          {currentSong.title}
        </h2>
        
        {currentSong.artist && (
          <p className="text-lg text-pink-dark mb-4">{currentSong.artist}</p>
        )}
        
        <div className="w-full bg-pink-light rounded-full h-2 mb-6">
          <div 
            className="bg-pink-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-center space-x-6">
          <button 
            onClick={onPrevious}
            className="p-3 bg-pink-light text-pink-primary rounded-full hover:bg-pink-secondary hover:text-white"
          >
            <FaBackward size={24} />
          </button>
          
          <button 
            onClick={handlePlayPause}
            className="p-5 bg-pink-primary text-white rounded-full hover:bg-pink-accent transform hover:scale-105 transition-all"
            disabled={!playerReady && !currentSong.videoId}
          >
            {isPlaying ? <FaPause size={32} /> : <FaPlay size={32} />}
          </button>
          
          <button 
            onClick={onNext}
            className="p-3 bg-pink-light text-pink-primary rounded-full hover:bg-pink-secondary hover:text-white"
          >
            <FaForward size={24} />
          </button>
        </div>
        
        {nextSong && (
          <div className="mt-8 text-center">
            <p className="text-sm text-pink-dark">Next up</p>
            <p className="text-lg font-semibold text-pink-primary">{nextSong.title}</p>
            {nextSong.artist && <p className="text-sm text-pink-dark">{nextSong.artist}</p>}
          </div>
        )}
      </div>
    </div>
  );
} 