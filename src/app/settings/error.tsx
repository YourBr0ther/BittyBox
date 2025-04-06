'use client';

import { FaCog, FaArrowLeft } from 'react-icons/fa';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to console
    console.error('Settings page error:', error);
  }, [error]);

  const handleBackToPlayer = () => {
    router.push('/');
  };

  const handleRetry = () => {
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-pink-accent flex items-center">
          <FaCog className="mr-2" /> Settings Error
        </h1>
        <button 
          onClick={handleBackToPlayer}
          className="btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Player
        </button>
      </div>
      
      <div className="card p-6 bg-pink-50 border border-pink-200">
        <h2 className="text-2xl font-bold text-pink-primary mb-4">Something went wrong</h2>
        <p className="mb-6 text-pink-dark">
          We encountered an error while loading your settings. You can try again or return to the player.
        </p>
        
        <div className="flex space-x-4">
          <button 
            onClick={handleRetry}
            className="px-6 py-2 bg-pink-primary text-white rounded-md hover:bg-pink-accent transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={handleBackToPlayer}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Return to Player
          </button>
        </div>
      </div>
    </div>
  );
} 