// src/hooks/useNfcScanner.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

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
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    // Check if Web NFC is supported
    setIsSupported('NDEFReader' in window);
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return;
    }

    try {
      setError(null);
      const controller = new AbortController();
      setAbortController(controller);

      // @ts-expect-error - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();

      await ndef.scan({ signal: controller.signal });
      setIsScanning(true);

      ndef.addEventListener('reading', ({ serialNumber }: { serialNumber: string }) => {
        // Convert serial number to a readable format
        const tagId = serialNumber || 'unknown';
        setLastScan({
          tagId,
          timestamp: Date.now(),
        });
      });

      ndef.addEventListener('readingerror', () => {
        setError('Error reading NFC tag. Try again.');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start NFC scanning';

      if (message.includes('permission')) {
        setError('Please allow NFC access to use Dots');
      } else {
        setError(message);
      }
      setIsScanning(false);
    }
  }, [isSupported]);

  const stopScanning = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsScanning(false);
  }, [abortController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return {
    isSupported,
    isScanning,
    lastScan,
    error,
    startScanning,
    stopScanning,
  };
}
