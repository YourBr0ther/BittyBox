'use client';

import { useEffect, useState } from 'react';

interface WaitingScreenProps {
  isScanning: boolean;
}

// Floating particle component
const FloatingParticle = ({
  delay,
  duration,
  size,
  left,
  emoji
}: {
  delay: number;
  duration: number;
  size: number;
  left: number;
  emoji: string;
}) => (
  <div
    className="absolute pointer-events-none select-none"
    style={{
      left: `${left}%`,
      top: '-10%',
      fontSize: `${size}rem`,
      animation: `floatUp ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      opacity: 0.7,
    }}
  >
    {emoji}
  </div>
);

// Sparkle star component
const Sparkle = ({
  top,
  left,
  delay,
  size
}: {
  top: number;
  left: number;
  delay: number;
  size: number;
}) => (
  <div
    className="absolute animate-sparkle"
    style={{
      top: `${top}%`,
      left: `${left}%`,
      animationDelay: `${delay}s`,
      width: `${size}px`,
      height: `${size}px`,
    }}
  >
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path
        d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
        fill="white"
        className="drop-shadow-lg"
      />
    </svg>
  </div>
);

// NFC icon with pulsing ring
const NfcIcon = ({ isScanning }: { isScanning: boolean }) => (
  <div className="relative">
    {/* Outer pulsing rings */}
    <div className={`absolute inset-0 rounded-full bg-magic-purple/20 ${isScanning ? 'animate-ping' : 'animate-pulse-glow'}`}
         style={{ transform: 'scale(1.8)' }} />
    <div className={`absolute inset-0 rounded-full bg-pink-primary/30 ${isScanning ? 'animate-ping' : 'animate-pulse-glow'}`}
         style={{ transform: 'scale(1.4)', animationDelay: '0.3s' }} />

    {/* Main NFC symbol container */}
    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-pink-primary via-magic-purple to-pink-accent flex items-center justify-center shadow-2xl animate-bounce-gentle">
      {/* Inner glow */}
      <div className="absolute inset-2 rounded-full bg-white/20 blur-sm" />

      {/* NFC waves */}
      <svg viewBox="0 0 100 100" className="w-20 h-20 md:w-24 md:h-24">
        <g fill="none" stroke="white" strokeWidth="4" strokeLinecap="round">
          {/* Phone/device shape */}
          <rect x="35" y="25" width="30" height="50" rx="4" className="fill-white/20" />

          {/* NFC waves */}
          <path d="M70 50 Q80 50 80 40" className={`${isScanning ? 'animate-pulse' : ''}`} style={{ animationDelay: '0s' }} />
          <path d="M70 50 Q85 50 85 35" className={`${isScanning ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.2s' }} />
          <path d="M70 50 Q90 50 90 30" className={`${isScanning ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.4s' }} />
        </g>
      </svg>
    </div>
  </div>
);

export default function WaitingScreen({ isScanning }: WaitingScreenProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; top: number; left: number; delay: number; size: number }>>([]);

  // Generate random sparkles on mount
  useEffect(() => {
    const newSparkles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: 12 + Math.random() * 16,
    }));
    setSparkles(newSparkles);
  }, []);

  const floatingEmojis = ['🎵', '🎶', '✨', '💖', '⭐', '🌟', '🎀', '💫'];

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-pink-light via-white to-magic-lavender/20">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-secondary/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-magic-lavender/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-magic-peach/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} {...sparkle} />
      ))}

      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <FloatingParticle
          key={i}
          emoji={emoji}
          delay={i * 1.5}
          duration={8 + Math.random() * 4}
          size={1.5 + Math.random() * 1.5}
          left={5 + (i * 12)}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Greeting */}
        <div className="mb-8 text-center animate-bounce-gentle">
          <span className="text-5xl md:text-6xl animate-wave inline-block">👋</span>
          <h2 className="font-magic text-2xl md:text-3xl text-magic-purple mt-2 drop-shadow-sm">
            Hi Roo!
          </h2>
        </div>

        {/* NFC Icon with rings */}
        <div className="mb-10">
          <NfcIcon isScanning={isScanning} />
        </div>

        {/* Main instruction text */}
        <div className="text-center space-y-4">
          <h1 className="font-magic text-4xl md:text-6xl lg:text-7xl text-pink-dark drop-shadow-lg animate-scale-in">
            Tap your Dot!
          </h1>
          <p className="font-magic text-xl md:text-2xl text-magic-purple/80 animate-float">
            ✨ Magic music awaits ✨
          </p>
        </div>

        {/* Scanning indicator */}
        {isScanning && (
          <div className="mt-8 flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full shadow-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="font-magic text-magic-purple">Ready to scan!</span>
          </div>
        )}

        {/* Decorative bottom elements */}
        <div className="absolute bottom-8 flex gap-4 text-4xl md:text-5xl">
          <span className="animate-bounce-gentle" style={{ animationDelay: '0s' }}>🎵</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>💖</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: '0.4s' }}>🎶</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: '0.6s' }}>✨</span>
          <span className="animate-bounce-gentle" style={{ animationDelay: '0.8s' }}>🎵</span>
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
