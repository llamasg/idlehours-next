'use client'

import { useEffect, useMemo } from 'react'
import ShareCard from './ShareCard'

// ── Confetti ────────────────────────────────────────────────────────────────

const CONFETTI_COLOURS = [
  '#c95d0d', '#2e8b57', '#e5a44d', '#d94f4f', '#5b8dd9', '#9b59b6',
]

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      size: 6 + Math.random() * 6,
      colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
      shape: (i % 2 === 0 ? 'square' : 'circle') as 'square' | 'circle',
    })), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
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

// ── ResultOverlay ───────────────────────────────────────────────────────────

interface ResultOverlayProps {
  dateStr: string
  score: number
  streak: number
  won: boolean
  onClose: () => void
}

export default function ResultOverlay({
  dateStr,
  score,
  streak,
  won,
  onClose,
}: ResultOverlayProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {won && <Confetti />}

      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl font-game text-center">
          {/* Heading */}
          <h2 className="mb-1 text-2xl font-bold text-foreground">
            {won ? 'Perfect Score!' : 'Game Over'}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {streak}/10 correct
          </p>

          {/* Score pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--game-blue))]/20 bg-white px-5 py-2">
            <span className="font-heading text-3xl font-black text-[hsl(var(--game-blue))]">
              {score}
            </span>
            <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
              pts
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <ShareCard dateStr={dateStr} score={score} streak={streak} won={won} />
            <button
              onClick={onClose}
              className="rounded-full border-2 border-border/60 px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
