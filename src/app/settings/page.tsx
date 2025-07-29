'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCog, FaGoogle, FaListUl, FaArrowLeft, FaSignOutAlt, FaUser, FaDownload, FaInfoCircle } from 'react-icons/fa';
import PlaylistUploader from '@/components/Playlists/PlaylistUploader';
import AddPlaylistByUrl from '@/components/Playlists/AddPlaylistByUrl';
import { YouTubeService, type Playlist } from '@/services/youtubeService';

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [tab, setTab] = useState<'general' | 'playlists' | 'account'>(
    (searchParams?.get('tab') as 'general' | 'playlists' | 'account') || 'general'
  );
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Update tab when URL changes
  useEffect(() => {
    if (!isHydrated) return;
    
    const tabParam = searchParams?.get('tab') as 'general' | 'playlists' | 'account';
    if (tabParam && ['general', 'playlists', 'account'].includes(tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams, isHydrated]);

  // Load playlists
  useEffect(() => {
    if (!isHydrated) return;
    
    const loadPlaylists = async () => {
      try {
        const fetchedPlaylists = await YouTubeService.getPlaylists();
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('Failed to load playlists:', error);
      }
    };
    
    loadPlaylists();
  }, [isHydrated]);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt.current = e;
      // Update UI to show the install button
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPrompt.current = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);
  
  const handleBackToPlayer = () => {
    router.push('/');
  };
  
  const handleImportPlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists((prevPlaylists) => [...prevPlaylists, ...newPlaylists]);
    // In a real app, we would save these to storage here
  };
  
  const handleSignIn = () => {
    // Regular sign in
    window.location.href = '/api/auth/signin/google?callbackUrl=/settings?tab=account';
  };
  
  const handleSignOut = () => {
    // Regular sign out
    window.location.href = '/api/auth/signout?callbackUrl=/settings?tab=account';
  };
  
  const handleInstallApp = async () => {
    if (!deferredPrompt.current) {
      return;
    }
    
    // Show the install prompt
    deferredPrompt.current.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.current.userChoice;
    
    // We no longer need the prompt regardless of the outcome
    deferredPrompt.current = null;
    setIsInstallable(false);
    
    if (choiceResult.outcome === 'accepted') {
      // User accepted the install prompt
    } else {
      // User dismissed the install prompt
    }
  };
  
  const handleTabChange = (newTab: 'general' | 'playlists' | 'account') => {
    setTab(newTab);
    // Use replace instead of push to avoid building up history
    router.replace(`/settings?tab=${newTab}`);
  };

  // Don't render until hydrated to avoid mismatch
  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-accent flex items-center">
            <FaCog className="mr-2" /> Parent Settings
          </h1>
        </div>
        <div className="text-center py-8">
          <div className="w-10 h-10 border-4 border-pink-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

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
          onClick={() => handleTabChange('general')}
        >
          General
        </button>
        <button
          className={`py-3 px-6 font-semibold ${tab === 'playlists' ? 'text-pink-accent border-b-2 border-pink-accent' : 'text-pink-dark'}`}
          onClick={() => handleTabChange('playlists')}
        >
          Playlists
        </button>
        <button
          className={`py-3 px-6 font-semibold ${tab === 'account' ? 'text-pink-accent border-b-2 border-pink-accent' : 'text-pink-dark'}`}
          onClick={() => handleTabChange('account')}
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
          
          <div className="mb-6">
            <label className="block text-pink-dark mb-2 font-semibold">Volume Level</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="80"
              className="w-full accent-pink-primary" 
            />
          </div>
          
          <div>
            <label className="block text-pink-dark mb-2 font-semibold">Install as App</label>
            {isInstalled ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700">BittyBox is installed as an app! 🎉</p>
              </div>
            ) : isInstallable ? (
              <button 
                onClick={handleInstallApp}
                className="flex items-center bg-pink-primary text-white py-2 px-4 rounded-md hover:bg-pink-accent transition-all"
              >
                <FaDownload className="mr-2" /> Install BittyBox
              </button>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-700">
                  Visit BittyBox in Chrome or Safari to install it as an app on your device.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {tab === 'playlists' && (
        <div>
          <div className="card p-6 mb-6">
            <h2 className="text-2xl font-bold text-pink-primary mb-4">Manage Playlists</h2>
            <p className="mb-6 text-pink-dark">
              Add playlists by entering a YouTube URL or importing from a CSV file.
            </p>
            
            <AddPlaylistByUrl 
              onPlaylistAdded={(playlist) => {
                setPlaylists((prevPlaylists) => [...prevPlaylists, playlist]);
              }} 
            />
            
            <div className="mt-8 border-t border-pink-light pt-8">
              <h3 className="text-xl font-bold text-pink-primary mb-4">Import from CSV</h3>
              <PlaylistUploader onPlaylistsImported={handleImportPlaylists} />
            </div>
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
                No playlists added yet. Add a playlist URL above or import from CSV.
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
          
          <div className="flex justify-center mb-8">
            <button 
              onClick={handleSignIn}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 border border-gray-400 rounded-lg shadow flex items-center"
            >
              <FaGoogle className="mr-2 text-[#4285F4]" /> Sign in with Google
            </button>
          </div>
          
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