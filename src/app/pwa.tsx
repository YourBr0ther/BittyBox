'use client';

import { useEffect } from 'react';

// Extend Window interface to include workbox
declare global {
  interface Window {
    workbox?: any;
  }
}

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox === undefined
    ) {
      // Register the service worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}

export default PWARegister; 