'use client';

import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';

interface MusicPlayerProps {
  currentSong?: {
    title: string;
    artist?: string;
    thumbnail?: string;
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

export default function MusicPlayer({
  currentSong = { title: 'No song selected' },
  nextSong = { title: 'No upcoming songs' },
  onPlay = () => {},
  onPause = () => {},
  onNext = () => {},
  onPrevious = () => {},
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 0;
          }
          return prev + 0.5;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);
  
  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className="card w-full max-w-lg mx-auto p-6">
      <div className="flex flex-col items-center">
        {currentSong.thumbnail ? (
          <img 
            src={currentSong.thumbnail} 
            alt={currentSong.title} 
            className="w-48 h-48 rounded-xl shadow-lg mb-4 object-cover"
          />
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