'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaCog, FaGoogle, FaListUl, FaArrowLeft, FaSignOutAlt, FaUser, FaDownload, FaInfoCircle } from 'react-icons/fa';
import PlaylistUploader from '@/components/Playlists/PlaylistUploader';
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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<'general' | 'playlists' | 'account'>('general');
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStatic, setIsStatic] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're in a static environment (no API endpoints)
    const checkStatic = async () => {
      try {
        const response = await fetch('/api/auth/session');
        // If we get a 404, we're in a static environment
        setIsStatic(response.status === 404);
      } catch (error) {
        // If the fetch fails, we're in a static environment
        setIsStatic(true);
      }
    };
    
    checkStatic();
  }, []);

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
    if (isStatic) {
      // In static site, just show an alert
      alert('Authentication is not available in static site mode. Please use the live version of the site to sign in.');
      return;
    }
    
    // Regular sign in for dev or non-static builds
    window.location.href = '/api/auth/signin/google?callbackUrl=/settings?tab=account';
  };
  
  const handleSignOut = () => {
    if (isStatic) {
      // In static site, just show an alert
      alert('Authentication is not available in static site mode. Please use the live version of the site to sign out.');
      return;
    }
    
    // Regular sign out for dev or non-static builds
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
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };
  
  // Render the account section for static builds
  const renderStaticAccount = () => (
    <div className="mb-8">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaInfoCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Static Site Mode:</strong> Authentication with Google is not available in this static deployment. Please use the live version of the site to sign in.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mb-8">
        <button 
          onClick={handleSignIn}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 border border-gray-400 rounded-lg shadow flex items-center opacity-60 cursor-not-allowed"
          disabled
        >
          <FaGoogle className="mr-2 text-[#4285F4]" /> Sign in with Google (Disabled in Static Mode)
        </button>
      </div>
    </div>
  );
  
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
          
          {isStatic ? (
            renderStaticAccount()
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