'use client';

interface ErrorScreenProps {
  type: 'unknown_dot' | 'speaker_offline' | 'nfc_unsupported' | 'generic';
  message: string;
  onDismiss: () => void;
}

// Friendly error illustrations as inline SVG components
const SadCloud = () => (
  <svg viewBox="0 0 200 150" className="w-48 h-36 md:w-64 md:h-48">
    {/* Cloud body */}
    <ellipse cx="100" cy="80" rx="60" ry="40" fill="#E8D5F2" />
    <ellipse cx="60" cy="85" rx="35" ry="28" fill="#E8D5F2" />
    <ellipse cx="140" cy="85" rx="35" ry="28" fill="#E8D5F2" />
    <ellipse cx="80" cy="60" rx="30" ry="25" fill="#E8D5F2" />
    <ellipse cx="120" cy="55" rx="35" ry="28" fill="#E8D5F2" />

    {/* Sad face */}
    <circle cx="80" cy="80" r="6" fill="#9D4EDD" /> {/* Left eye */}
    <circle cx="120" cy="80" r="6" fill="#9D4EDD" /> {/* Right eye */}

    {/* Sad mouth */}
    <path
      d="M85 100 Q100 90 115 100"
      stroke="#9D4EDD"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />

    {/* Tear drops */}
    <ellipse cx="75" cy="95" rx="3" ry="5" fill="#87CEEB" className="animate-bounce-gentle" />
    <ellipse cx="125" cy="95" rx="3" ry="5" fill="#87CEEB" className="animate-bounce-gentle" style={{ animationDelay: '0.3s' }} />
  </svg>
);

const ConfusedDot = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 md:h-64">
    {/* Dot circle */}
    <circle cx="100" cy="100" r="70" fill="url(#dotGradient)" />
    <defs>
      <linearGradient id="dotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFB5D4" />
        <stop offset="100%" stopColor="#FF6B9D" />
      </linearGradient>
    </defs>

    {/* Confused eyes */}
    <circle cx="75" cy="90" r="10" fill="white" />
    <circle cx="125" cy="90" r="10" fill="white" />
    <circle cx="77" cy="92" r="5" fill="#333" />
    <circle cx="127" cy="88" r="5" fill="#333" />

    {/* Question marks floating */}
    <text x="150" y="60" fontSize="30" fill="#9D4EDD" className="animate-float">?</text>
    <text x="40" y="50" fontSize="24" fill="#C77DFF" className="animate-float" style={{ animationDelay: '0.5s' }}>?</text>

    {/* Confused mouth */}
    <path
      d="M80 120 Q90 115 100 120 Q110 125 120 118"
      stroke="#D43F6A"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />

    {/* Blush */}
    <ellipse cx="60" cy="105" rx="10" ry="6" fill="#FFB5D4" opacity="0.6" />
    <ellipse cx="140" cy="105" rx="10" ry="6" fill="#FFB5D4" opacity="0.6" />
  </svg>
);

const SleepingSpeaker = () => (
  <svg viewBox="0 0 200 180" className="w-48 h-44 md:w-64 md:h-56">
    {/* Speaker body */}
    <rect x="50" y="40" width="100" height="120" rx="20" fill="#E8D5F2" />
    <rect x="60" y="50" width="80" height="100" rx="15" fill="#D4C4E3" />

    {/* Speaker grille circles */}
    <circle cx="100" cy="90" r="25" fill="#C4B4D3" />
    <circle cx="100" cy="90" r="18" fill="#B4A4C3" />

    {/* Closed eyes (sleeping) */}
    <path
      d="M75 70 Q85 65 95 70"
      stroke="#9D4EDD"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M105 70 Q115 65 125 70"
      stroke="#9D4EDD"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />

    {/* ZZZ */}
    <text x="140" y="40" fontSize="20" fill="#9D4EDD" className="animate-float" fontFamily="var(--font-fredoka)">Z</text>
    <text x="150" y="25" fontSize="16" fill="#C77DFF" className="animate-float" style={{ animationDelay: '0.3s' }} fontFamily="var(--font-fredoka)">Z</text>
    <text x="160" y="15" fontSize="12" fill="#E8D5F2" className="animate-float" style={{ animationDelay: '0.6s' }} fontFamily="var(--font-fredoka)">z</text>

    {/* Moon and stars */}
    <text x="20" y="60" fontSize="24" className="animate-sparkle">🌙</text>
    <text x="170" y="80" fontSize="16" className="animate-sparkle" style={{ animationDelay: '0.5s' }}>⭐</text>
  </svg>
);

const SadTablet = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 md:h-64">
    {/* Tablet body */}
    <rect x="40" y="30" width="120" height="150" rx="15" fill="#E8D5F2" />
    <rect x="50" y="45" width="100" height="110" rx="8" fill="#F5F0FA" />

    {/* Screen content - sad face */}
    <circle cx="80" cy="90" r="6" fill="#9D4EDD" />
    <circle cx="120" cy="90" r="6" fill="#9D4EDD" />
    <path
      d="M85 115 Q100 105 115 115"
      stroke="#9D4EDD"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />

    {/* X marks */}
    <text x="60" y="75" fontSize="16" fill="#FF6B9D">✕</text>
    <text x="130" y="75" fontSize="16" fill="#FF6B9D">✕</text>

    {/* NFC symbol with X */}
    <g transform="translate(75, 130) scale(0.8)">
      <path
        d="M10 15 L20 15 L20 35 L10 35 Z"
        stroke="#9D4EDD"
        strokeWidth="2"
        fill="none"
      />
      <path d="M20 25 Q25 25 25 20" stroke="#9D4EDD" strokeWidth="2" fill="none" />
      <path d="M20 25 Q28 25 28 17" stroke="#9D4EDD" strokeWidth="2" fill="none" />
      <path d="M20 25 Q31 25 31 14" stroke="#9D4EDD" strokeWidth="2" fill="none" />
    </g>

    {/* Home button */}
    <circle cx="100" cy="170" r="8" fill="#D4C4E3" />
  </svg>
);

// Error content configurations
const errorContent: Record<ErrorScreenProps['type'], {
  title: string;
  subtitle: string;
  Illustration: React.FC;
  buttonText: string;
  emoji: string;
}> = {
  unknown_dot: {
    title: "Hmm, who's that?",
    subtitle: "I don't know this Dot yet!",
    Illustration: ConfusedDot,
    buttonText: "Try another Dot",
    emoji: "🤔",
  },
  speaker_offline: {
    title: "Shh, speaker sleeping!",
    subtitle: "Can't reach the speaker right now",
    Illustration: SleepingSpeaker,
    buttonText: "Try again",
    emoji: "😴",
  },
  nfc_unsupported: {
    title: "Oops!",
    subtitle: "This tablet can't read Dots",
    Illustration: SadTablet,
    buttonText: "OK",
    emoji: "📱",
  },
  generic: {
    title: "Oh no!",
    subtitle: "Something went wrong",
    Illustration: SadCloud,
    buttonText: "Try again",
    emoji: "💫",
  },
};

export default function ErrorScreen({ type, message, onDismiss }: ErrorScreenProps) {
  const content = errorContent[type] || errorContent.generic;
  const { title, subtitle, Illustration, buttonText, emoji } = content;

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-pink-light via-white to-magic-lavender/20 flex flex-col items-center justify-center px-6">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-4xl animate-float opacity-40">☁️</div>
      <div className="absolute top-20 right-16 text-3xl animate-float opacity-40" style={{ animationDelay: '1s' }}>☁️</div>
      <div className="absolute bottom-20 left-20 text-2xl animate-sparkle opacity-60">✨</div>
      <div className="absolute bottom-32 right-24 text-2xl animate-sparkle opacity-60" style={{ animationDelay: '0.5s' }}>✨</div>

      {/* Main content */}
      <div className="text-center animate-scale-in">
        {/* Emoji header */}
        <div className="text-6xl mb-4 animate-bounce-gentle">
          {emoji}
        </div>

        {/* Illustration */}
        <div className="mb-6 animate-float" style={{ animationDuration: '4s' }}>
          <Illustration />
        </div>

        {/* Title */}
        <h1 className="font-magic text-4xl md:text-5xl text-pink-dark drop-shadow-lg mb-2">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="font-magic text-xl md:text-2xl text-magic-purple/80 mb-2">
          {subtitle}
        </p>

        {/* Custom message if different from subtitle */}
        {message !== subtitle && (
          <p className="text-sm text-magic-purple/60 mb-6 max-w-xs mx-auto">
            {message}
          </p>
        )}

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="mt-6 px-10 py-4 md:px-14 md:py-5 bg-gradient-to-r from-pink-primary to-magic-purple text-white font-magic text-xl md:text-2xl rounded-full shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-pink-primary/50"
        >
          <span className="flex items-center gap-2">
            {buttonText}
            <span className="text-2xl">→</span>
          </span>
        </button>

        {/* Encouraging message */}
        <p className="mt-8 font-magic text-lg text-magic-purple/60 animate-pulse">
          Don't worry, you got this! 💪
        </p>
      </div>
    </div>
  );
}
