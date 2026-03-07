'use client'

import type { GuessRecord } from '../lib/storage'
import { GAMES } from '../data/games'

interface GuessListProps {
  guesses: GuessRecord[]
}

const TOTAL = GAMES.length

function badgeClasses(rank: number): string {
  if (rank <= 50) return 'bg-green-500/15 text-green-700 border-green-500/30'
  if (rank <= 200) return 'bg-amber-500/15 text-amber-700 border-amber-500/30'
  if (rank <= 500) return 'bg-orange-500/15 text-orange-700 border-orange-500/30'
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

export default function GuessList({ guesses }: GuessListProps) {
  if (guesses.length === 0) return null

  const sorted = [...guesses].sort((a, b) => a.proximity - b.proximity)

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((guess, i) => {
        const proximityPct = Math.max(0, Math.min(100, 100 - ((guess.proximity / TOTAL) * 100)))
        return (
          <div
            key={`${guess.gameId}-${i}`}
            className="relative overflow-hidden rounded-lg border border-border/60 bg-white px-4 py-3"
          >
            {/* Proximity fill bar */}
            <div
              className={`absolute inset-y-0 left-0 ${barColor(guess.proximity)}`}
              style={{ width: `${proximityPct}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-semibold text-[hsl(var(--game-ink))]">
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
