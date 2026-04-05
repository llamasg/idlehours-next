// src/app/play/shelf-price/lib/dateUtils.ts
// Shelf Price — date math, epoch, pair generation, display helpers

import { GAMES, type ShelfPriceGame } from '../data/games'

import {
  getTodayDateString,
  formatDisplayDate,
  isToday,
  getDaysSinceEpoch as _getDaysSinceEpoch,
  formatGameNumber as _formatGameNumber,
  isPlayableDate as _isPlayableDate,
  getArchiveDates as _getArchiveDates,
} from '@/lib/dateUtils'

// TODO: STABILITY — daily game selection is derived from GAMES.length and array
// shuffling. Adding games changes past date assignments. This is acceptable pre-launch
// but must be fixed before significant archive growth.
//
// Fix: build a pre-computed daily-schedule.ts that maps dates to game IDs explicitly.
// Trigger: implement this before launch or before database exceeds 2,000 games,
// whichever comes first. See docs/plans/daily-schedule-stability.md

// ── Constants ────────────────────────────────────────────────────────────────

export const LAUNCH_DATE = '2026-03-03'
export const EPOCH = new Date('2026-03-03T00:00:00+00:00')

// ── Re-export shared utils bound to this game's dates ──────────────────────

export { getTodayDateString, formatDisplayDate, isToday }
export const getDaysSinceEpoch = (dateStr: string) => _getDaysSinceEpoch(EPOCH, dateStr)
export const formatGameNumber = (dateStr: string) => _formatGameNumber(LAUNCH_DATE, dateStr)
export const isPlayableDate = (dateStr: string) => _isPlayableDate(LAUNCH_DATE, dateStr)
export const getArchiveDates = () => _getArchiveDates(LAUNCH_DATE)

// ── Game-specific functions ────────────────────────────────────────────────

export function getGameNumber(dateStr: string): number {
  return getDaysSinceEpoch(dateStr) + 1
}

// ── Seeded PRNG (mulberry32) ────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Pair generation ─────────────────────────────────────────────────────────

export type GamePair = [ShelfPriceGame, ShelfPriceGame]

/**
 * Generate 11 deterministic pairs for a given date.
 * 10 correct answers needed to win, plus 1 spare.
 * Each pair has different prices.
 */
export function getPairsForDate(dateStr: string): GamePair[] {
  const seed = getDaysSinceEpoch(dateStr) + 42
  const rng = mulberry32(seed)
  const shuffled = shuffle(GAMES, rng)

  const pairs: GamePair[] = []
  let i = 0
  while (pairs.length < 11 && i + 1 < shuffled.length) {
    const a = shuffled[i]
    const b = shuffled[i + 1]
    if (a.launchPriceUsd !== b.launchPriceUsd) {
      pairs.push([a, b])
    }
    i += 2
  }

  return pairs
}
