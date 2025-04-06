'use client';

import { useState } from 'react';
import { FaUpload, FaCheck, FaTimes } from 'react-icons/fa';
import { YouTubeService, type Playlist } from '@/services/youtubeService';

interface PlaylistUploaderProps {
  onPlaylistsImported: (playlists: Playlist[]) => void;
}

export default function PlaylistUploader({ onPlaylistsImported }: PlaylistUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };
  
  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please upload a CSV or TXT file');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const content = await readFileContent(file);
      const playlists = await YouTubeService.importPlaylistsFromCSV(content);
      
      setUploadSuccess(true);
      onPlaylistsImported(playlists);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to process the file. Please check the format.');
      console.error('Error processing file:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  };
  
  return (
    <div className="mt-8 w-full max-w-lg mx-auto">
      <div 
        className={`
          border-2 border-dashed p-8 rounded-xl text-center
          ${isDragging ? 'border-pink-accent bg-pink-light' : 'border-pink-secondary'}
          ${isUploading ? 'opacity-70' : ''}
          transition-all duration-200
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-pink-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-pink-dark">Uploading playlist...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center justify-center text-green-600">
            <FaCheck size={40} className="mb-2" />
            <p>Playlists imported successfully!</p>
          </div>
        ) : (
          <>
            <FaUpload size={32} className="text-pink-primary mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-pink-accent mb-2">Upload Playlist CSV</h3>
            <p className="text-pink-dark mb-4">
              Drag &amp; drop a CSV file or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Format: playlist name, YouTube URL, icon name (optional)
            </p>
            <label className="btn-secondary inline-block cursor-pointer">
              Browse Files
              <input 
                type="file" 
                accept=".csv,.txt" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
            
            {error && (
              <div className="mt-4 text-red-500 flex items-center justify-center">
                <FaTimes className="mr-1" /> {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 