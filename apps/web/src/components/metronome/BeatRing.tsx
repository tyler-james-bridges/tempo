'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface BeatRingProps {
  beats: number;
  currentBeat: number;
  isPlaying: boolean;
  tempo: number;
  isAccented: (beat: number) => boolean;
  onTap: () => void;
  children: ReactNode;
}

const RING_SIZE = 280;

export function BeatRing({
  beats,
  currentBeat,
  isPlaying,
  tempo,
  isAccented,
  onTap,
  children,
}: BeatRingProps) {
  const [rotation, setRotation] = useState(0);
  const [pulsingBeat, setPulsingBeat] = useState<number | null>(null);

  // Ring rotation animation
  useEffect(() => {
    if (!isPlaying) {
      setRotation(0);
      return;
    }

    const duration = (60 / tempo) * beats * 1000;
    const startTime = Date.now();
    const startRotation = rotation;

    let animationFrame: number;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      setRotation(startRotation + progress * 360);
      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying, tempo, beats]);

  // Beat pulse animation
  useEffect(() => {
    if (isPlaying && currentBeat > 0) {
      setPulsingBeat(currentBeat);
      const timeout = setTimeout(() => setPulsingBeat(null), 200);
      return () => clearTimeout(timeout);
    }
  }, [currentBeat, isPlaying]);

  return (
    <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
      {/* Outer rotating ring */}
      <div
        className="absolute inset-0 rounded-full border border-white/10 transition-opacity"
        style={{
          transform: `rotate(${rotation}deg)`,
          opacity: isPlaying ? 0.8 : 0.2,
        }}
      >
        {/* Ring marker */}
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-[#E8913A] shadow-[0_0_10px_#E8913A]"
          style={{
            top: -5,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Beat indicators */}
      {Array.from({ length: beats }).map((_, i) => {
        const angle = (i / beats) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * (RING_SIZE / 2 - 16);
        const y = Math.sin(angle) * (RING_SIZE / 2 - 16);
        const isActive = currentBeat === i + 1 && isPlaying;
        const isAccentBeat = isAccented(i + 1);
        const isPulsing = pulsingBeat === i + 1;

        return (
          <div
            key={i}
            className={`absolute rounded-full transition-all duration-100 ${
              isActive
                ? 'bg-[#E8913A] shadow-[0_0_10px_#E8913A]'
                : isAccentBeat
                  ? 'bg-white'
                  : 'bg-white/30'
            }`}
            style={{
              width: isAccentBeat ? 14 : 10,
              height: isAccentBeat ? 14 : 10,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${isPulsing ? 1.4 : 1})`,
            }}
          />
        );
      })}

      {/* Center touch area */}
      <button
        onClick={onTap}
        className="absolute inset-[30px] rounded-full flex items-center justify-center hover:bg-[#E8913A]/5 active:bg-[#E8913A]/10 transition-colors"
        aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}
      >
        {children}
      </button>
    </div>
  );
}
