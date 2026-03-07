'use client'

import { useEffect, useMemo } from 'react'
import type { StreetDateGame } from '../data/games'
import type { CoverAttempt, Wager } from '../lib/storage'
import ResultsReveal from './ResultsReveal'
import ShareCard from './ShareCard'

// ── Types ────────────────────────────────────────────────────────────────────

interface WinModalProps {
  dateStr: string
  answerYear: number
  games: StreetDateGame[]
  attempts: CoverAttempt[]
  stars: number
  score: number
  won: boolean
  wager: Wager
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

// ── Wager label ─────────────────────────────────────────────────────────────

const WAGER_LABELS: Record<Wager, string> = {
  low: '🛡️ Cautious (x0.5)',
  mid: '🎯 Confident (x1)',
  high: '🔥 All In (x2)',
}

// ── WinModal ─────────────────────────────────────────────────────────────────

export default function WinModal({
  dateStr,
  answerYear,
  games,
  attempts,
  stars,
  score,
  won,
  wager,
  onClose,
}: WinModalProps) {
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
        <div className="mx-4 w-full max-w-[860px] rounded-3xl bg-card p-6 shadow-2xl font-game sm:p-8 lg:p-10">
          <div className="lg:grid lg:grid-cols-[1fr_1.5fr] lg:gap-8 lg:items-center">
            {/* Left column */}
            <div className="text-center lg:text-left">
              <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                {won ? 'You got it!' : 'Game Over'}
              </h2>

              {/* Score pill */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--game-blue))]/20 bg-white px-5 py-2">
                <span className="font-heading text-2xl font-black text-[hsl(var(--game-blue))]">
                  {score}
                </span>
                <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                  pts
                </span>
              </div>

              {/* Wager badge */}
              <p className="mb-4 text-sm text-muted-foreground">
                {WAGER_LABELS[wager]}
              </p>

              {/* Answer year */}
              <p className="mb-6 text-4xl font-bold text-[hsl(var(--game-blue))] sm:text-5xl lg:mb-0">
                {answerYear}
              </p>
            </div>

            {/* Right column */}
            <div>
              <ResultsReveal
                answerYear={answerYear}
                games={games}
                attempts={attempts}
                stars={stars}
                hideYear
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <ShareCard
              dateStr={dateStr}
              answerYear={answerYear}
              score={score}
              wager={wager}
              attempts={attempts}
            />
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
