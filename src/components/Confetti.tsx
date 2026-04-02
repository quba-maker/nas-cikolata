import { useState, useEffect } from 'react';

interface ConfettiProps { active: boolean; }

const COLORS = ['#6B1D3A', '#C9A96E', '#D4A0B5', '#22C55E', '#F59E0B', '#EC4899'];

export default function Confetti({ active }: ConfettiProps) {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    setPieces(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 2,
        duration: 2.5 + Math.random() * 2,
      }))
    );
  }, [active]);

  if (!active) return null;

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  );
}
