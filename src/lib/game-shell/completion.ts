// Single read path for "did the player finish today's puzzle?" across the
// three daily games. Replaces the independent localStorage readers that were
// forked in DailyBadgeShelf and TodayCard (one of which read the dead
// street_date_ v1 key, and both of which computed "today" in machine-local
// time instead of the games' Europe/London boundary).
//
// The write side lives in each game's storage module; the key prefixes here
// must stay in lockstep (CLAUDE.md rule). This is the seam the upcoming
// badges sync plugs into, until the per-game manifest generalises it.

import { getTodayDateString } from '@/lib/dateUtils'
import { type GameSlug, getRankForGame } from '@/lib/ranks'

export interface DailyCompletion {
  completed: boolean
  won: boolean
  score: number
  rankName: string
}

const NOT_PLAYED: DailyCompletion = { completed: false, won: false, score: 0, rankName: '' }

function readJson(key: string): Record<string, unknown> | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  return JSON.parse(raw) as Record<string, unknown>
}

/**
 * Completion state for one daily game on one date (defaults to today,
 * Europe/London). Returns NOT_PLAYED on the server and on any parse error.
 *
 * Win-condition asymmetry preserved from the original readers: Game Sense
 * counts only won days as completed (a lost day shows "Not played");
 * Street Date and Shelf Price count any finished day.
 */
export function getDailyCompletion(
  slug: GameSlug,
  dateStr: string = getTodayDateString(),
): DailyCompletion {
  if (typeof window === 'undefined') return NOT_PLAYED

  try {
    switch (slug) {
      case 'game-sense': {
        const state = readJson(`game_sense_${dateStr}`)
        if (!state || !state.won) return NOT_PLAYED
        const score = state.score as number
        return { completed: true, won: true, score, rankName: getRankForGame(slug, score, 0) }
      }
      case 'street-date': {
        const state = readJson(`street_date_v3_${dateStr}`)
        if (!state || !state.finished) return NOT_PLAYED
        const score = state.score as number
        return { completed: true, won: !!state.won, score, rankName: getRankForGame(slug, score, 0) }
      }
      case 'shelf-price': {
        const state = readJson(`shelf_price_v2_${dateStr}`)
        if (!state || !state.finished) return NOT_PLAYED
        const score = state.score as number
        return {
          completed: true,
          won: !!state.won,
          score,
          rankName: getRankForGame(slug, score, (state.correctCount as number) ?? 0),
        }
      }
    }
  } catch {
    return NOT_PLAYED
  }
}
