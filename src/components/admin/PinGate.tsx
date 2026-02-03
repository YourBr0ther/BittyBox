/**
 * PinGate - Soft child-proofing for admin settings
 *
 * NOTE: This is NOT a security measure. The PIN is client-side only
 * and provides a simple barrier to prevent accidental access by children.
 * For actual security, implement server-side authentication.
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface PinGateProps {
  children: React.ReactNode;
}

export default function PinGate({ children }: PinGateProps) {
  const [pin, setPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + digit;
    setPin(newPin);
    setError(null);

    // Check PIN when 4 digits entered
    if (newPin.length === 4) {
      if (newPin === correctPin) {
        setIsUnlocked(true);
      } else {
        setError('Oops! Try again');
        setIsShaking(true);
        timeoutRef.current = setTimeout(() => {
          setPin('');
          setIsShaking(false);
        }, 500);
      }
    }
  }, [pin, correctPin]);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  }, []);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-light to-white flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🔐</span>
        <h1 role="heading" className="font-magic text-3xl md:text-4xl text-pink-dark">
          Grown-Up Settings
        </h1>
        <p className="text-pink-primary mt-2 text-lg">Enter your PIN to continue</p>
      </div>

      {/* PIN Dots Display */}
      <div className={`flex gap-4 mb-8 ${isShaking ? 'animate-wiggle' : ''}`}>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            data-testid={pin.length > index ? 'pin-dot-filled' : 'pin-dot'}
            className={`w-4 h-4 rounded-full border-2 border-pink-primary transition-all duration-200 ${
              pin.length > index
                ? 'bg-pink-primary scale-110'
                : 'bg-white'
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-pink-accent mb-4 font-semibold animate-pulse">
          {error}
        </p>
      )}

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3 max-w-xs">
        {digits.map((digit, index) => {
          if (digit === '') {
            return <div key={index} className="min-w-14 min-h-14" />;
          }

          if (digit === 'del') {
            return (
              <button
                key={index}
                onClick={handleDelete}
                aria-label="Delete"
                className="min-w-14 min-h-14 rounded-full bg-pink-secondary/50 hover:bg-pink-secondary active:scale-95 flex items-center justify-center text-2xl text-pink-dark transition-all shadow-md"
              >
                ⌫
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => handleDigit(digit)}
              aria-label={digit}
              className="min-w-14 min-h-14 rounded-full bg-white hover:bg-pink-light active:scale-95 flex items-center justify-center text-3xl font-bold text-pink-dark transition-all shadow-lg border-2 border-pink-secondary/30"
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/* Help text */}
      <p className="mt-8 text-sm text-pink-primary/70 text-center">
        This area is for parents and grown-ups only
      </p>
    </div>
  );
}
