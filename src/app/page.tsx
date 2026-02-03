// src/app/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNfcScanner } from '@/hooks/useNfcScanner';
import { WaitingScreen, NowPlayingScreen, SuccessAnimation, ErrorScreen } from '@/components/dots';

type AppState = 'waiting' | 'scanning' | 'success' | 'playing' | 'error';

interface PlayingInfo {
  playlistName: string;
  icon: string;
  color: string;
}

interface ErrorInfo {
  type: 'unknown_dot' | 'speaker_offline' | 'nfc_unsupported' | 'generic';
  message: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('waiting');
  const [playingInfo, setPlayingInfo] = useState<PlayingInfo | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Refs for cleanup and debouncing
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedScanRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);

  const { isSupported, isScanning, lastScan, startScanning } = useNfcScanner();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Start scanning on mount
  useEffect(() => {
    if (isSupported && !isScanning) {
      startScanning();
    }
  }, [isSupported, isScanning, startScanning]);

  // Handle NFC not supported (only after check completes)
  useEffect(() => {
    // Wait for support check to complete (isSupported will be null initially)
    if (isSupported === false) {
      setAppState('error');
      setErrorInfo({
        type: 'nfc_unsupported',
        message: "This tablet can't read Dots. Try using Chrome on an Android tablet!",
      });
    }
  }, [isSupported]);

  // Play TTS audio
  const playTTS = useCallback(async (phrase: string, playlistName?: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, playlistName }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.audioUrl) {
            const audio = new Audio(data.audioUrl);
            audio.play().catch(console.error);
          }
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  }, []);

  // Handle NFC scan
  useEffect(() => {
    if (!lastScan) return;

    // Create unique scan key from tagId and timestamp
    const scanKey = `${lastScan.tagId}-${lastScan.timestamp}`;

    // Debounce: Skip if we already processed this scan
    if (lastProcessedScanRef.current === scanKey) {
      return;
    }

    // Skip if we're currently processing a scan or showing success animation
    if (isProcessingRef.current || showSuccess) {
      return;
    }

    // Mark this scan as processed
    lastProcessedScanRef.current = scanKey;
    isProcessingRef.current = true;

    const handleScan = async () => {
      try {
        // Call play API
        const response = await fetch('/api/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId: lastScan.tagId }),
        });

        // Safe JSON parsing
        let data;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            throw new Error('Invalid response format');
          }
        } catch {
          throw new Error('Failed to parse response');
        }

        if (!response.ok) {
          if (response.status === 404) {
            setAppState('error');
            setErrorInfo({
              type: 'unknown_dot',
              message: "I don't know that Dot yet!",
            });
            playTTS('unknownDot');
          } else {
            setAppState('error');
            setErrorInfo({
              type: 'speaker_offline',
              message: data?.error || "Can't reach the speaker right now.",
            });
            playTTS('error');
          }
          isProcessingRef.current = false;
          return;
        }

        // Success! Show animation then playing screen
        setShowSuccess(true);
        setPlayingInfo({
          playlistName: data.mapping.playlistName,
          icon: data.mapping.icon,
          color: data.mapping.color,
        });

        // Play TTS
        playTTS('nowPlaying', data.mapping.playlistName);

        // Clear any existing timeout
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }

        // After animation, show now playing
        successTimeoutRef.current = setTimeout(() => {
          setShowSuccess(false);
          setAppState('playing');
          isProcessingRef.current = false;
        }, 2000);
      } catch (error) {
        console.error('Scan handling error:', error);
        setAppState('error');
        setErrorInfo({
          type: 'generic',
          message: 'Oops! Something went wrong.',
        });
        playTTS('error');
        isProcessingRef.current = false;
      }
    };

    handleScan();
  }, [lastScan, playTTS, showSuccess]);

  // Handle stop
  const handleStop = useCallback(async () => {
    // Clear any pending timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    try {
      await fetch('/api/stop', { method: 'POST' });
    } catch (error) {
      console.error('Stop error:', error);
    }

    // Reset state
    setPlayingInfo(null);
    setShowSuccess(false);
    setAppState('waiting');
    isProcessingRef.current = false;
    lastProcessedScanRef.current = null;
  }, []);

  // Handle dismiss error
  const handleDismissError = useCallback(() => {
    setErrorInfo(null);
    setAppState('waiting');
    isProcessingRef.current = false;
    lastProcessedScanRef.current = null;
  }, []);

  // Render success animation overlay
  if (showSuccess && playingInfo) {
    return <SuccessAnimation playlistName={playingInfo.playlistName} />;
  }

  // Render based on state
  switch (appState) {
    case 'playing':
      return playingInfo ? (
        <NowPlayingScreen
          playlistName={playingInfo.playlistName}
          icon={playingInfo.icon}
          color={playingInfo.color}
          onStop={handleStop}
        />
      ) : null;

    case 'error':
      return errorInfo ? (
        <ErrorScreen
          type={errorInfo.type}
          message={errorInfo.message}
          onDismiss={handleDismissError}
        />
      ) : null;

    case 'waiting':
    default:
      return <WaitingScreen isScanning={isScanning} />;
  }
}
