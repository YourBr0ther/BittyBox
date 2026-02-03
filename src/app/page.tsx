// src/app/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const { isSupported, isScanning, lastScan, error: nfcError, startScanning } = useNfcScanner();

  // Start scanning on mount
  useEffect(() => {
    if (isSupported && !isScanning) {
      startScanning();
    }
  }, [isSupported, isScanning, startScanning]);

  // Handle NFC not supported
  useEffect(() => {
    if (!isSupported && typeof window !== 'undefined') {
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
        const { audioUrl } = await response.json();
        const audio = new Audio(audioUrl);
        audio.play().catch(console.error);
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  }, []);

  // Handle NFC scan
  useEffect(() => {
    if (!lastScan) return;

    const handleScan = async () => {
      try {
        // Call play API
        const response = await fetch('/api/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId: lastScan.tagId }),
        });

        const data = await response.json();

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
              message: "Can't reach the speaker right now.",
            });
            playTTS('error');
          }
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

        // After animation, show now playing
        setTimeout(() => {
          setShowSuccess(false);
          setAppState('playing');
        }, 2000);
      } catch (error) {
        console.error('Scan handling error:', error);
        setAppState('error');
        setErrorInfo({
          type: 'generic',
          message: 'Oops! Something went wrong.',
        });
        playTTS('error');
      }
    };

    handleScan();
  }, [lastScan, playTTS]);

  // Handle stop
  const handleStop = useCallback(async () => {
    try {
      await fetch('/api/stop', { method: 'POST' });
    } catch (error) {
      console.error('Stop error:', error);
    }
    setPlayingInfo(null);
    setAppState('waiting');
  }, []);

  // Handle dismiss error
  const handleDismissError = useCallback(() => {
    setErrorInfo(null);
    setAppState('waiting');
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
