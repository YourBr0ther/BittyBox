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

  useEffect(() => {
    // Check if Web NFC is supported
    setIsSupported('NDEFReader' in window);

    // Mark as mounted
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
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
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // @ts-expect-error - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();
      ndefReaderRef.current = ndef;

      // Define event handlers as named functions for cleanup
      const handleReading = ({ serialNumber }: { serialNumber: string }) => {
        if (isMountedRef.current) {
          const tagId = serialNumber || 'unknown';
          setLastScan({
            tagId,
            timestamp: Date.now(),
          });
        }
      };

      const handleReadingError = () => {
        if (isMountedRef.current) {
          setError('Error reading NFC tag. Try again.');
        }
      };

      const handleAbort = () => {
        if (isMountedRef.current) {
          setIsScanning(false);
        }
      };

      await ndef.scan({ signal: controller.signal });

      if (isMountedRef.current) {
        setIsScanning(true);
      }

      ndef.addEventListener('reading', handleReading);
      ndef.addEventListener('readingerror', handleReadingError);
      controller.signal.addEventListener('abort', handleAbort);

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
  }, [isSupported, isScanning]);

  const stopScanning = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    ndefReaderRef.current = null;
    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isSupported,
    isScanning,
    lastScan,
    error,
    startScanning,
    stopScanning,
  };
}
