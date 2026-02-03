// src/hooks/useNfcScanner.ts

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface NfcScanResult {
  tagId: string;
  timestamp: number;
}

interface UseNfcScannerReturn {
  isSupported: boolean;
  isScanning: boolean;
  lastScan: NfcScanResult | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
}

export function useNfcScanner(): UseNfcScannerReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<NfcScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures and manage cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const ndefReaderRef = useRef<unknown>(null);
  const isMountedRef = useRef(true);

  // Store event handler refs for proper cleanup
  const handleReadingRef = useRef<((event: { serialNumber: string }) => void) | null>(null);
  const handleReadingErrorRef = useRef<(() => void) | null>(null);
  const handleAbortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Check if Web NFC is supported
    setIsSupported('NDEFReader' in window);

    // Mark as mounted
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cleanup function to remove all event listeners
  const cleanupListeners = useCallback(() => {
    if (ndefReaderRef.current) {
      const ndef = ndefReaderRef.current as {
        removeEventListener: (type: string, handler: unknown) => void
      };
      if (handleReadingRef.current) {
        ndef.removeEventListener('reading', handleReadingRef.current);
      }
      if (handleReadingErrorRef.current) {
        ndef.removeEventListener('readingerror', handleReadingErrorRef.current);
      }
    }
    if (abortControllerRef.current && handleAbortRef.current) {
      abortControllerRef.current.signal.removeEventListener('abort', handleAbortRef.current);
    }

    // Clear refs
    handleReadingRef.current = null;
    handleReadingErrorRef.current = null;
    handleAbortRef.current = null;
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return;
    }

    // Prevent concurrent scans
    if (isScanning) {
      return;
    }

    try {
      setError(null);

      // Clean up any existing listeners first
      cleanupListeners();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // @ts-expect-error - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();
      ndefReaderRef.current = ndef;

      // Create event handlers and store in refs
      handleReadingRef.current = ({ serialNumber }: { serialNumber: string }) => {
        if (isMountedRef.current) {
          const tagId = serialNumber || 'unknown';
          setLastScan({
            tagId,
            timestamp: Date.now(),
          });
        }
      };

      handleReadingErrorRef.current = () => {
        if (isMountedRef.current) {
          setError('Error reading NFC tag. Try again.');
        }
      };

      handleAbortRef.current = () => {
        if (isMountedRef.current) {
          setIsScanning(false);
        }
      };

      await ndef.scan({ signal: controller.signal });

      if (isMountedRef.current) {
        setIsScanning(true);
      }

      // Attach event listeners
      ndef.addEventListener('reading', handleReadingRef.current);
      ndef.addEventListener('readingerror', handleReadingErrorRef.current);
      controller.signal.addEventListener('abort', handleAbortRef.current);

    } catch (err) {
      if (!isMountedRef.current) return;

      const message = err instanceof Error ? err.message : 'Failed to start NFC scanning';

      if (message.includes('permission')) {
        setError('Please allow NFC access to use Dots');
      } else {
        setError(message);
      }
      setIsScanning(false);
    }
  }, [isSupported, isScanning, cleanupListeners]);

  const stopScanning = useCallback(() => {
    // Remove event listeners first
    cleanupListeners();

    // Then abort and clear refs
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    ndefReaderRef.current = null;
    setIsScanning(false);
  }, [cleanupListeners]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupListeners();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cleanupListeners]);

  return {
    isSupported,
    isScanning,
    lastScan,
    error,
    startScanning,
    stopScanning,
  };
}
