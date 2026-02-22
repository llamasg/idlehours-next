'use client'

import { useEffect, useMemo } from 'react'
import type { GuessRecord } from '../lib/storage'
import ShareCard from './ShareCard'
import GamePromoCard from './GamePromoCard'
import { useSanityGame } from '../lib/useSanityGame'

// ── Types ────────────────────────────────────────────────────────────────────

interface WinModalProps {
  dateStr: string
  gameTitle: string
  gameSlug?: string
  score: number
  guesses: GuessRecord[]
  lifelinesUsedCount: number
  onClose: () => void
}

// ── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLOURS = [
  '#c95d0d',
  '#2e8b57',
  '#e5a44d',
  '#d94f4f',
  '#5b8dd9',
  '#9b59b6',
]

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  size: number
  colour: string
  shape: 'square' | 'circle'
}

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    size: 6 + Math.random() * 6,
    colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
    shape: i % 2 === 0 ? 'square' : 'circle',
  }))
}

function Confetti() {
  const pieces = useMemo(() => generatePieces(40), [])

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

// ── WinModal ─────────────────────────────────────────────────────────────────

export default function WinModal({
  dateStr,
  gameTitle,
  gameSlug,
  score,
  guesses,
  lifelinesUsedCount,
  onClose,
}: WinModalProps) {
  const { game: sanityGame } = useSanityGame(gameSlug ?? null)

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      <Confetti />

      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* Card */}
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
          {/* Heading */}
          <h2 className="mb-1 text-center font-heading text-2xl font-bold text-foreground">
            You got it!
          </h2>
          <p className="mb-5 text-center font-heading text-lg text-primary">
            {gameTitle}
          </p>

          {/* Score + Guesses grid */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
              <p className="font-heading text-2xl font-bold text-foreground">
                {score}
              </p>
              <p className="font-heading text-xs uppercase tracking-wide text-muted-foreground">
                Score
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
              <p className="font-heading text-2xl font-bold text-foreground">
                {guesses.length}
              </p>
              <p className="font-heading text-xs uppercase tracking-wide text-muted-foreground">
                Guesses
              </p>
            </div>
          </div>

          {/* Lifelines used */}
          {lifelinesUsedCount > 0 && (
            <p className="mb-4 text-center font-heading text-sm text-muted-foreground">
              Lifelines used: {lifelinesUsedCount}
            </p>
          )}

          {/* Sanity game promo card */}
          {sanityGame && (
            <div className="mb-4">
              <GamePromoCard game={sanityGame} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <ShareCard
              dateStr={dateStr}
              gameTitle={gameTitle}
              score={score}
              guesses={guesses}
              lifelinesUsedCount={lifelinesUsedCount}
            />
            <button
              onClick={onClose}
              className="font-heading text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
