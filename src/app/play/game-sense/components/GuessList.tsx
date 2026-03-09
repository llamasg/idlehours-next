'use client'

import type { GuessRecord } from '../lib/storage'
import { GAMES } from '../data/games'

interface GuessListProps {
  guesses: GuessRecord[]
  /** Stagger delay (ms) per row for entrance animation. 0 = no animation. */
  entranceDelay?: number
}

const TOTAL = GAMES.length

function badgeClasses(rank: number): string {
  if (rank <= 50) return 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30'
  if (rank <= 200) return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
  if (rank <= 500) return 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30'
  return 'bg-red-500/10 text-red-400 border-red-500/20'
}

function barColor(rank: number): string {
  if (rank <= 50) return 'bg-green-500/20'
  if (rank <= 200) return 'bg-amber-500/20'
  if (rank <= 500) return 'bg-orange-500/20'
  return 'bg-red-500/15'
}

function lookupTitle(gameId: string): string {
  const game = GAMES.find((g) => g.id === gameId)
  return game?.title ?? gameId
}

export default function GuessList({ guesses, entranceDelay = 0 }: GuessListProps) {
  if (guesses.length === 0) return null

  const sorted = [...guesses].sort((a, b) => a.proximity - b.proximity)

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((guess, i) => {
        const proximityPct = Math.max(0, Math.min(100, 100 - ((guess.proximity / TOTAL) * 100)))
        return (
          <div
            key={`${guess.gameId}-${i}`}
            className="relative overflow-hidden rounded-lg border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] px-4 py-3"
            style={entranceDelay > 0 ? {
              animation: `gs-fade-in 0.4s ease ${i * entranceDelay}ms both`,
            } : undefined}
          >
            {/* Proximity fill bar */}
            <div
              className={`absolute inset-y-0 left-0 ${barColor(guess.proximity)}`}
              style={{ width: `${proximityPct}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--game-ink))]">
                {guess.isHint && (
                  <svg className="h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--game-ink-light))]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                {lookupTitle(guess.gameId)}
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-heading text-xs font-bold ${badgeClasses(guess.proximity)}`}
              >
                {guess.proximity === 1 ? '✓' : guess.proximity}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
