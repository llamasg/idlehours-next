'use client'

import { useEffect, useMemo } from 'react'
import type { GuessRecord } from '../lib/storage'
import type { GameSenseGame } from '../data/games'
import ShareCard from './ShareCard'
import GamePromoCard from './GamePromoCard'
import { useSanityGame } from '../lib/useSanityGame'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'

// ── Types ────────────────────────────────────────────────────────────────────

interface WinModalProps {
  dateStr: string
  answer: GameSenseGame
  score: number
  guesses: GuessRecord[]
  blanksRevealedCount: number
  onClose: () => void
}

// ── Confetti ─────────────────────────────────────────────────────────────────

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

// ── WinModal ─────────────────────────────────────────────────────────────────

export default function WinModal({
  dateStr,
  answer,
  score,
  guesses,
  blanksRevealedCount,
  onClose,
}: WinModalProps) {
  const { game: sanityGame } = useSanityGame(answer.id)
  const coverUrl = answer.igdbImageId ? igdbCoverUrl(answer.igdbImageId) : null

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

      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-xl font-game">
          {/* Cover hero */}
          {coverUrl && (
            <div className="relative w-full overflow-hidden bg-secondary" style={{ maxHeight: '280px' }}>
              <img
                src={coverUrl}
                alt={answer.title}
                className="w-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-xl font-black text-white drop-shadow-md">
                  {answer.title}
                </h2>
                <p className="text-xs font-semibold text-white/70">
                  {answer.year} &middot; {answer.genres.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Heading — only if no cover */}
            {!coverUrl && (
              <>
                <h2 className="mb-1 text-center text-2xl font-bold text-foreground">
                  You got it!
                </h2>
                <p className="mb-5 text-center text-lg text-[hsl(var(--game-blue))]">
                  {answer.title}
                </p>
              </>
            )}

            {/* "You got it" banner when cover exists */}
            {coverUrl && (
              <p className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-[hsl(var(--game-green))]">
                You got it!
              </p>
            )}

            {/* Score + Guesses grid */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
                <p className="font-heading text-2xl font-bold text-[hsl(var(--game-blue))]">
                  {score}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Score
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
                <p className="font-heading text-2xl font-bold text-foreground">
                  {guesses.length}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Guesses
                </p>
              </div>
            </div>

            {/* Blanks revealed */}
            {blanksRevealedCount > 0 && (
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Clues revealed: {blanksRevealedCount}/5
              </p>
            )}

            {/* Sanity game promo card (link to our review/page if we have one) */}
            {sanityGame && (
              <div className="mb-4">
                <GamePromoCard game={sanityGame} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center gap-3">
              <ShareCard
                dateStr={dateStr}
                gameTitle={answer.title}
                score={score}
                guesses={guesses}
                blanksRevealedCount={blanksRevealedCount}
              />
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
