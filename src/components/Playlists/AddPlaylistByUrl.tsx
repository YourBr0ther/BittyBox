'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { YouTubeService, type Playlist, extractPlaylistId } from '@/services/youtubeService';

interface AddPlaylistByUrlProps {
  onPlaylistAdded: (playlist: Playlist) => void;
}

export default function AddPlaylistByUrl({ onPlaylistAdded }: AddPlaylistByUrlProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Extract playlist ID from URL
      const playlistId = extractPlaylistId(url);
      if (!playlistId) {
        throw new Error('Invalid YouTube playlist URL');
      }

      // Try to fetch playlist details from YouTube
      const updatedPlaylist = await YouTubeService.getPlaylistDetails(playlistId);
      
      onPlaylistAdded(updatedPlaylist);
      setSuccess(true);
      setUrl('');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add playlist');
      console.error('Error adding playlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until hydrated
  if (!isHydrated) {
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playlistUrl" className="block text-sm font-medium text-pink-dark mb-2">
            Add YouTube Playlist URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="playlistUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              className="flex-1 px-4 py-2 border border-pink-light rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-accent"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary flex items-center justify-center min-w-[100px] ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaPlus className="mr-2" /> Add
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-500">
            <FaTimes className="mr-1" /> {error}
          </div>
        )}

        {success && (
          <div className="flex items-center text-green-600">
            <FaCheck className="mr-1" /> Playlist added successfully!
          </div>
        )}
      </form>
    </div>
  );
} 