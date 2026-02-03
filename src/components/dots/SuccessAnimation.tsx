'use client';

import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  playlistName: string;
}

// Confetti particle component
const Confetti = ({
  color,
  delay,
  left,
  rotation
}: {
  color: string;
  delay: number;
  left: number;
  rotation: number;
}) => (
  <div
    className="absolute top-0 w-3 h-3 md:w-4 md:h-4"
    style={{
      left: `${left}%`,
      backgroundColor: color,
      animation: `confettiFall 2.5s ease-out ${delay}s forwards`,
      transform: `rotate(${rotation}deg)`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }}
  />
);

// Burst star component
const BurstStar = ({
  delay,
  angle,
  distance,
  size,
  color
}: {
  delay: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}) => {
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        animation: `starExpand 0.8s ease-out ${delay}s forwards`,
        '--x': `${x}px`,
        '--y': `${y}px`,
      } as React.CSSProperties}
    >
      <span
        className="text-2xl md:text-3xl"
        style={{ color, filter: 'drop-shadow(0 0 8px currentColor)' }}
      >
        ✦
      </span>
    </div>
  );
};

// Emoji burst component
const EmojiBurst = ({
  emoji,
  delay,
  angle,
  distance
}: {
  emoji: string;
  delay: number;
  angle: number;
  distance: number;
}) => {
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;

  return (
    <div
      className="absolute left-1/2 top-1/2 text-4xl md:text-5xl"
      style={{
        animation: `emojiBurst 1s ease-out ${delay}s forwards`,
        '--x': `${x}px`,
        '--y': `${y}px`,
      } as React.CSSProperties}
    >
      {emoji}
    </div>
  );
};

export default function SuccessAnimation({ playlistName }: SuccessAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    color: string;
    delay: number;
    left: number;
    rotation: number;
  }>>([]);

  const confettiColors = ['#FF6B9D', '#FFB5D4', '#9D4EDD', '#C77DFF', '#FFD93D', '#FFB4A2', '#fff'];
  const burstEmojis = ['⭐', '✨', '💖', '🎵', '🌟', '💫', '🎶', '🎀'];

  useEffect(() => {
    // Generate confetti
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: Math.random() * 0.5,
      left: Math.random() * 100,
      rotation: Math.random() * 360,
    }));
    setConfetti(newConfetti);
  }, []);

  const starBursts = Array.from({ length: 12 }, (_, i) => ({
    angle: i * 30,
    distance: 100 + Math.random() * 50,
    size: 20 + Math.random() * 20,
    color: confettiColors[i % confettiColors.length],
    delay: i * 0.05,
  }));

  const emojiBursts = burstEmojis.map((emoji, i) => ({
    emoji,
    angle: i * 45,
    distance: 150 + Math.random() * 50,
    delay: 0.2 + i * 0.05,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-magic-gold/20 via-pink-light to-magic-lavender/30 flex items-center justify-center">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-60" />

      {/* Confetti */}
      {confetti.map((piece) => (
        <Confetti key={piece.id} {...piece} />
      ))}

      {/* Star bursts */}
      {starBursts.map((star, i) => (
        <BurstStar key={i} {...star} />
      ))}

      {/* Emoji bursts */}
      {emojiBursts.map((burst, i) => (
        <EmojiBurst key={i} {...burst} />
      ))}

      {/* Central content */}
      <div className="relative z-10 text-center animate-scale-in">
        {/* Big celebration emoji */}
        <div className="text-8xl md:text-9xl mb-6 animate-bounce-gentle">
          🎉
        </div>

        {/* Success message */}
        <h1 className="font-magic text-4xl md:text-6xl text-pink-dark drop-shadow-lg mb-4">
          Now playing
        </h1>
        <h2 className="font-magic text-3xl md:text-5xl text-magic-purple drop-shadow-md">
          {playlistName}!
        </h2>

        {/* Sparkle decorations */}
        <div className="flex justify-center gap-4 mt-6 text-3xl">
          <span className="animate-sparkle">✨</span>
          <span className="animate-sparkle" style={{ animationDelay: '0.2s' }}>💖</span>
          <span className="animate-sparkle" style={{ animationDelay: '0.4s' }}>✨</span>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes starExpand {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1);
            opacity: 0;
          }
        }

        @keyframes emojiBurst {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.2);
            opacity: 0;
          }
        }

        .bg-radial-glow {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(255, 217, 61, 0.4) 0%,
            rgba(255, 107, 157, 0.2) 30%,
            transparent 70%
          );
        }
      `}</style>
    </div>
  );
}
