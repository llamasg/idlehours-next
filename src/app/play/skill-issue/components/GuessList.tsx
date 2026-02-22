'use client'

import type { GuessRecord } from '../lib/storage'
import { GAMES } from '../data/games'

interface GuessListProps {
  guesses: GuessRecord[]
  answerYear: number | null
}

function badgeClasses(proximity: number): string {
  if (proximity <= 100) return 'bg-green-500/15 text-green-700 border-green-500/30'
  if (proximity <= 300) return 'bg-amber-500/15 text-amber-700 border-amber-500/30'
  if (proximity <= 600) return 'bg-orange-500/15 text-orange-700 border-orange-500/30'
  return 'bg-red-500/10 text-red-400 border-red-500/20'
}

function lookupTitle(gameId: string): string {
  const game = GAMES.find((g) => g.id === gameId)
  return game?.title ?? gameId
}

function lookupYear(gameId: string): number | undefined {
  return GAMES.find((g) => g.id === gameId)?.year
}

function directionArrow(
  gameId: string,
  answerYear: number,
  proximity: number,
): string {
  if (proximity === 1) return ''
  const guessYear = lookupYear(gameId)
  if (guessYear == null) return ''
  if (answerYear > guessYear) return ' ▲'
  if (answerYear < guessYear) return ' ▼'
  return ''
}

export default function GuessList({ guesses, answerYear }: GuessListProps) {
  if (guesses.length === 0) return null

  const sorted = [...guesses].sort((a, b) => a.proximity - b.proximity)

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((guess, i) => (
        <div
          key={`${guess.gameId}-${i}`}
          className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3"
        >
          <span className="font-heading text-sm text-foreground">
            {lookupTitle(guess.gameId)}
          </span>
          <span
            className={`rounded-full border px-3 py-1 font-heading text-xs font-bold ${badgeClasses(guess.proximity)}`}
          >
            {guess.proximity === 1 ? '✓' : guess.proximity}
            {answerYear != null && directionArrow(guess.gameId, answerYear, guess.proximity)}
          </span>
        </div>
      ))}
    </div>
  )
}
