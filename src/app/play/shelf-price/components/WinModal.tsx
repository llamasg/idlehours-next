'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ShelfPriceGame } from '../data/games'
import type { PriceGuess } from '../lib/storage'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'
import StarScore from '../../street-date/components/StarScore'
import ShareCard from './ShareCard'

// ── Types ────────────────────────────────────────────────────────────────────

interface WinModalProps {
  dateStr: string
  actualPrice: number
  game: ShelfPriceGame
  guesses: PriceGuess[]
  stars: number
  score: number
  won: boolean
  hintUsed: boolean
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
  actualPrice,
  game,
  guesses,
  stars,
  score,
  won,
  hintUsed,
  onClose,
}: WinModalProps) {
  const [imgFailed, setImgFailed] = useState(false)

  // Suppress unused variable warning
  void guesses

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
      {won && <Confetti />}

      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* Card */}
        <div className="mx-4 w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            {/* Heading */}
            <h2 className="mb-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {won ? 'You got it!' : 'Game Over'}
            </h2>

            {/* Stars */}
            <div className="mb-3">
              <StarScore stars={stars} size="lg" />
            </div>

            {/* Score */}
            <p className="mb-4 font-heading text-xl font-bold text-foreground">
              {score} pts
            </p>

            {/* Actual price */}
            <p className="mb-6 font-heading text-3xl font-bold text-primary sm:text-4xl">
              ${actualPrice.toFixed(2)}
            </p>

            {/* Small game cover thumbnail */}
            <div className="mx-auto mb-2 w-[120px]">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted/30 shadow-sm">
                {imgFailed ? (
                  <div className="flex h-full w-full items-center justify-center p-2">
                    <span className="text-center font-heading text-[10px] leading-tight text-muted-foreground">
                      {game.title}
                    </span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={igdbCoverUrl(game.igdbImageId)}
                    alt={game.title}
                    className="h-full w-full object-cover"
                    onError={() => setImgFailed(true)}
                  />
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-center font-heading text-xs font-medium leading-snug text-muted-foreground">
                {game.title}
              </p>
            </div>

            {/* Hint used indicator */}
            {hintUsed && (
              <p className="mt-2 text-sm text-muted-foreground">
                Hint used (-1★)
              </p>
            )}
          </div>

          {/* Actions — inline buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <ShareCard
              dateStr={dateStr}
              stars={stars}
              actualPrice={actualPrice}
            />
            <button
              onClick={onClose}
              className="rounded-full border-2 border-border/60 px-6 py-2.5 font-heading text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
