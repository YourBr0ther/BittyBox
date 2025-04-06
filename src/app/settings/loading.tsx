'use client';

import { useEffect } from 'react';
import { FaCog } from 'react-icons/fa';

export default function SettingsLoading() {
  // Add fallback redirect to handle potential loading failures
  useEffect(() => {
    const timeout = setTimeout(() => {
      // If loading takes too long, redirect to home
      window.location.href = '/';
    }, 8000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-3xl font-bold text-pink-accent flex items-center">
          <FaCog className="mr-2 animate-spin" /> Loading Settings...
        </h1>
      </div>
      
      <div className="card p-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-pink-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-lg text-pink-dark">Just a moment while we load your settings...</p>
      </div>
    </div>
  );
} 