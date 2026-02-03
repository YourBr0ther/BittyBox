'use client';

import { useState, useEffect } from 'react';

interface NowPlayingScreenProps {
  playlistName: string;
  icon: string;
  color: string;
  onStop: () => void;
}

// Icon mapping to emojis
const iconToEmoji: Record<string, string> = {
  star: '⭐',
  heart: '💖',
  music: '🎵',
  sparkles: '✨',
  rainbow: '🌈',
  unicorn: '🦄',
  castle: '🏰',
  butterfly: '🦋',
  flower: '🌸',
  sun: '☀️',
  moon: '🌙',
  cloud: '☁️',
  cat: '🐱',
  dog: '🐶',
  bunny: '🐰',
};

// Animated music bar component
const MusicBar = ({ delay, height }: { delay: number; height: number }) => (
  <div
    className="w-3 md:w-4 rounded-full bg-white/80"
    style={{
      animation: `musicBounce 0.6s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      height: `${height}%`,
    }}
  />
);

// Floating note component
const FloatingNote = ({ emoji, delay, left }: { emoji: string; delay: number; left: number }) => (
  <div
    className="absolute text-4xl md:text-5xl animate-float pointer-events-none"
    style={{
      left: `${left}%`,
      bottom: '20%',
      animationDelay: `${delay}s`,
      opacity: 0.6,
    }}
  >
    {emoji}
  </div>
);

// Dancing character component
const DancingEmoji = ({ emoji, delay }: { emoji: string; delay: number }) => (
  <span
    className="inline-block animate-wiggle text-5xl md:text-6xl"
    style={{ animationDelay: `${delay}s` }}
  >
    {emoji}
  </span>
);

export default function NowPlayingScreen({ playlistName, icon, color, onStop }: NowPlayingScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Slight delay for content entrance animation
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const displayEmoji = iconToEmoji[icon] || '🎵';
  const musicBars = [60, 80, 50, 90, 70, 85, 55, 75];
  const floatingNotes = ['🎵', '🎶', '💫', '✨'];

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, ${color}40 0%, ${color}20 50%, #FFE2EF 100%)`,
      }}
    >
      {/* Animated background circles */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-blob"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20 animate-blob animation-delay-2000"
        style={{ backgroundColor: color }}
      />

      {/* Floating music notes */}
      {floatingNotes.map((note, i) => (
        <FloatingNote key={i} emoji={note} delay={i * 0.5} left={10 + i * 25} />
      ))}

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Now Playing label */}
        <div className="mb-4 px-6 py-2 bg-white/40 backdrop-blur-sm rounded-full">
          <span className="font-magic text-lg md:text-xl text-pink-dark flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now Playing
          </span>
        </div>

        {/* Main icon display */}
        <div
          className="relative mb-8 animate-bounce-gentle"
          style={{ animationDuration: '3s' }}
        >
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{
              transform: 'scale(1.2)',
              boxShadow: `0 0 60px ${color}80, 0 0 100px ${color}40`,
            }}
          />

          {/* Icon container */}
          <div
            className="relative w-40 h-40 md:w-52 md:h-52 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
            }}
          >
            {/* Inner shine */}
            <div className="absolute inset-3 rounded-full bg-white/10 blur-sm" />

            {/* Main emoji */}
            <DancingEmoji emoji={displayEmoji} delay={0} />
          </div>
        </div>

        {/* Playlist name */}
        <h1 className="font-magic text-4xl md:text-5xl lg:text-6xl text-center text-pink-dark drop-shadow-lg mb-6 animate-scale-in">
          {playlistName}
        </h1>

        {/* Music visualizer */}
        <div className="flex items-end gap-1 md:gap-2 h-20 mb-10">
          {musicBars.map((height, i) => (
            <MusicBar key={i} delay={i * 0.1} height={height} />
          ))}
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          className="group relative px-12 py-6 md:px-16 md:py-8 bg-gradient-to-r from-pink-primary via-pink-accent to-magic-purple rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-pink-primary/50"
        >
          {/* Button glow */}
          <div className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 transition-all" />

          {/* Button content */}
          <div className="relative flex items-center gap-3">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span className="font-magic text-2xl md:text-3xl text-white">Stop</span>
          </div>
        </button>

        {/* Dancing emoji row */}
        <div className="mt-8 flex gap-4">
          <DancingEmoji emoji="💃" delay={0} />
          <DancingEmoji emoji="🎶" delay={0.2} />
          <DancingEmoji emoji="🕺" delay={0.4} />
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes musicBounce {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
