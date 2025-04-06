'use client';

import { useState, useEffect } from 'react';
import { FaMusic, FaHeart } from 'react-icons/fa';
import MusicPlayer from '@/components/Player/MusicPlayer';
import PlaylistSelector from '@/components/Playlists/PlaylistSelector';
import { YouTubeService, type Playlist, type Song } from '@/services/youtubeService';

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const fetchedPlaylists = await YouTubeService.getPlaylists();
        setPlaylists(fetchedPlaylists);
        
        // Set default playlist if available
        if (fetchedPlaylists.length > 0) {
          setCurrentPlaylist(fetchedPlaylists[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load playlists:', error);
        setIsLoading(false);
      }
    };
    
    loadPlaylists();
  }, []);
  
  useEffect(() => {
    const loadSongs = async () => {
      if (currentPlaylist) {
        try {
          setIsLoading(true);
          const fetchedSongs = await YouTubeService.getSongsForPlaylist(currentPlaylist.id);
          setSongs(fetchedSongs);
          setCurrentSongIndex(0);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to load songs:', error);
          setIsLoading(false);
        }
      }
    };
    
    if (currentPlaylist) {
      loadSongs();
    }
  }, [currentPlaylist?.id]);
  
  const handleSelectPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
  };
  
  const handlePlayPause = () => {
    if (songs.length > 0) {
      const currentSong = songs[currentSongIndex];
      YouTubeService.playSong(currentSong.videoId);
    }
  };
  
  const handleNext = () => {
    if (songs.length > 0) {
      const nextIndex = (currentSongIndex + 1) % songs.length;
      setCurrentSongIndex(nextIndex);
    }
  };
  
  const handlePrevious = () => {
    if (songs.length > 0) {
      const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      setCurrentSongIndex(prevIndex);
    }
  };
  
  const currentSong = songs.length > 0 ? songs[currentSongIndex] : undefined;
  const nextSong = songs.length > 0 ? songs[(currentSongIndex + 1) % songs.length] : undefined;
  
  const navigateToSettings = () => {
    window.location.href = '/settings';
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-pink-accent mb-8 flex items-center">
        <FaMusic className="mr-2" /> BittyBox <FaHeart className="ml-2 text-pink-primary" />
      </h1>
      
      {isLoading ? (
        <div className="text-center p-12">
          <div className="w-16 h-16 border-4 border-pink-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-dark">Loading your music...</p>
        </div>
      ) : (
        <>
          <MusicPlayer 
            currentSong={currentSong}
            nextSong={nextSong}
            onPlay={handlePlayPause}
            onPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
          
          <PlaylistSelector 
            playlists={playlists}
            onSelectPlaylist={handleSelectPlaylist}
            currentPlaylistId={currentPlaylist?.id}
          />
        </>
      )}
      
      <footer className="mt-10 text-center text-sm text-pink-dark">
        <p>BittyBox - Made with love for little music lovers 💖</p>
        <button 
          className="text-xs mt-2 text-gray-400 hover:text-pink-dark"
          onClick={navigateToSettings}
        >
          Grown-Up Settings
        </button>
      </footer>
    </div>
  );
} 