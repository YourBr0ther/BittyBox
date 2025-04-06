'use client';

import { useState } from 'react';
import { FaStar, FaHeart, FaMagic, FaCat, FaDog, FaIceCream } from 'react-icons/fa';

interface Playlist {
  id: string;
  name: string;
  icon: string;
  url: string;
}

const DEFAULT_ICONS = [
  { icon: 'star', component: <FaStar size={32} /> },
  { icon: 'heart', component: <FaHeart size={32} /> },
  { icon: 'magic', component: <FaMagic size={32} /> },
  { icon: 'cat', component: <FaCat size={32} /> },
  { icon: 'dog', component: <FaDog size={32} /> },
  { icon: 'icecream', component: <FaIceCream size={32} /> },
];

const getIconComponent = (iconName: string) => {
  const found = DEFAULT_ICONS.find(i => i.icon === iconName);
  return found ? found.component : <FaStar size={32} />;
};

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  currentPlaylistId?: string;
}

export default function PlaylistSelector({
  playlists = [],
  onSelectPlaylist,
  currentPlaylistId,
}: PlaylistSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  return (
    <div className="mt-8 w-full max-w-lg mx-auto">
      <button 
        onClick={toggleExpand}
        className="w-full bg-pink-light p-4 rounded-xl mb-4 text-pink-accent font-bold flex items-center justify-center"
      >
        <span className="mr-2">{isExpanded ? 'Hide' : 'Choose'} Playlists</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 mt-2 transition-all duration-300">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => {
                onSelectPlaylist(playlist);
                setIsExpanded(false);
              }}
              className={`
                flex flex-col items-center justify-center p-5 rounded-xl transition-all
                ${currentPlaylistId === playlist.id 
                  ? 'bg-pink-primary text-white' 
                  : 'bg-white hover:bg-pink-light text-pink-dark'}
              `}
            >
              <div className="mb-3">{getIconComponent(playlist.icon)}</div>
              <p className="font-bold text-center">{playlist.name}</p>
            </button>
          ))}
          
          {playlists.length === 0 && (
            <div className="col-span-2 text-center p-8 bg-white rounded-xl">
              <p className="text-pink-dark">No playlists added yet!</p>
              <p className="text-sm mt-2">Ask a grown-up to add some for you.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 