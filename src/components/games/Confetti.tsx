'use client'

import { useMemo } from 'react'

// Extracted from the removed GameEndModal.tsx — currently has no importers.
// Kept for the planned return of win celebrations with the game shell.
// Relies on the confetti-fall keyframes in tailwind.config.js.

const DEFAULT_CONFETTI = ['#4A8FE8', '#C8873A', '#27A85A', '#F0EBE0', '#2D6BC4']

export default function Confetti({ colours = DEFAULT_CONFETTI }: { colours?: string[] }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        size: 4 + Math.random() * 8,
        colour: colours[i % colours.length],
        shape: (i % 2 === 0 ? 'square' : 'circle') as 'square' | 'circle',
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 -top-10 z-10 h-[300px] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-[confetti-fall_2.5s_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            width: p.size,
            height: p.size,
            backgroundColor: p.colour,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  )
}
