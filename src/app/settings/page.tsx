'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { FaCog, FaGoogle, FaListUl, FaArrowLeft, FaSignOutAlt, FaUser } from 'react-icons/fa';
import PlaylistUploader from '@/components/Playlists/PlaylistUploader';
import { YouTubeService, type Playlist } from '@/services/youtubeService';

export default function SettingsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<'general' | 'playlists' | 'account'>('general');
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const fetchedPlaylists = await YouTubeService.getPlaylists();
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('Failed to load playlists:', error);
      }
    };
    
    loadPlaylists();
  }, []);
  
  const handleBackToPlayer = () => {
    router.push('/');
  };
  
  const handleImportPlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists((prevPlaylists) => [...prevPlaylists, ...newPlaylists]);
    // In a real app, we would save these to storage here
  };
  
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/settings?tab=account' });
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/settings?tab=account' });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-pink-accent flex items-center">
          <FaCog className="mr-2" /> Parent Settings
        </h1>
        <button 
          onClick={handleBackToPlayer}
          className="btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Player
        </button>
      </div>
      
      <div className="flex mb-6 border-b border-pink-light">
        <button
          className={`py-3 px-6 font-semibold ${tab === 'general' ? 'text-pink-accent border-b-2 border-pink-accent' : 'text-pink-dark'}`}
          onClick={() => setTab('general')}
        >
          General
        </button>
        <button
          className={`py-3 px-6 font-semibold ${tab === 'playlists' ? 'text-pink-accent border-b-2 border-pink-accent' : 'text-pink-dark'}`}
          onClick={() => setTab('playlists')}
        >
          Playlists
        </button>
        <button
          className={`py-3 px-6 font-semibold ${tab === 'account' ? 'text-pink-accent border-b-2 border-pink-accent' : 'text-pink-dark'}`}
          onClick={() => setTab('account')}
        >
          Account
        </button>
      </div>
      
      {tab === 'general' && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-pink-primary mb-4">General Settings</h2>
          
          <div className="mb-6">
            <label className="block text-pink-dark mb-2 font-semibold">PIN Protection</label>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 h-5 w-5 accent-pink-primary" 
              />
              <span>Enable PIN for settings access</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-pink-dark mb-2 font-semibold">Interface Settings</label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2 h-5 w-5 accent-pink-primary" 
                  defaultChecked 
                />
                <span>Show next song</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2 h-5 w-5 accent-pink-primary" 
                  defaultChecked 
                />
                <span>Enable animations</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-pink-dark mb-2 font-semibold">Volume Level</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="80"
              className="w-full accent-pink-primary" 
            />
          </div>
        </div>
      )}
      
      {tab === 'playlists' && (
        <div>
          <div className="card p-6 mb-6">
            <h2 className="text-2xl font-bold text-pink-primary mb-4">Manage Playlists</h2>
            <p className="mb-6 text-pink-dark">
              Import playlists from a CSV file or manage existing ones.
            </p>
            
            <PlaylistUploader onPlaylistsImported={handleImportPlaylists} />
          </div>
          
          <div className="card p-6">
            <h2 className="text-xl font-bold text-pink-primary mb-4 flex items-center">
              <FaListUl className="mr-2" /> Current Playlists
            </h2>
            
            {playlists.length > 0 ? (
              <ul className="divide-y divide-pink-light">
                {playlists.map((playlist, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{playlist.name}</p>
                      <p className="text-sm text-gray-500">{playlist.url}</p>
                    </div>
                    <button className="text-pink-accent hover:text-pink-primary">Edit</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-8 text-pink-dark">
                No playlists imported yet. Use the uploader above to add playlists.
              </p>
            )}
          </div>
        </div>
      )}
      
      {tab === 'account' && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-pink-primary mb-4">Account Settings</h2>
          <p className="mb-6 text-pink-dark">
            Connect your Google account to enable YouTube Premium features.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center mb-8">
              <div className="w-10 h-10 border-4 border-pink-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : session ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6 p-4 bg-pink-light/50 rounded-lg">
                <div className="flex items-center">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user?.name || 'User'} 
                      className="w-12 h-12 rounded-full mr-4" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-pink-primary flex items-center justify-center mr-4">
                      <FaUser className="text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{session.user?.name}</p>
                    <p className="text-sm text-gray-600">{session.user?.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow flex items-center"
                >
                  <FaSignOutAlt className="mr-2 text-pink-primary" /> Sign Out
                </button>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <p className="font-semibold text-green-700">Connected to YouTube</p>
                <p className="text-sm text-green-600">Your YouTube Premium account is now connected.</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-8">
              <button 
                onClick={handleSignIn}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 border border-gray-400 rounded-lg shadow flex items-center"
              >
                <FaGoogle className="mr-2 text-[#4285F4]" /> Sign in with Google
              </button>
            </div>
          )}
          
          <div className="bg-pink-light/50 p-4 rounded-lg">
            <h3 className="font-semibold text-pink-dark mb-2">Why connect?</h3>
            <ul className="list-disc list-inside text-pink-dark space-y-1 text-sm">
              <li>Enable ad-free playback with your YouTube Premium account</li>
              <li>Access your personal playlists</li>
              <li>Better video quality options</li>
              <li>Improved reliability</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 