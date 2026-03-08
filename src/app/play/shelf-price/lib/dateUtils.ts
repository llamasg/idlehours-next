// src/app/play/shelf-price/lib/dateUtils.ts
// Shelf Price — date math, epoch, pair generation, display helpers

import { GAMES, type ShelfPriceGame } from '../data/games'

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

const TZ = 'Europe/London'
const MS_PER_DAY = 86_400_000

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseUTCDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
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

// ── Public API ───────────────────────────────────────────────────────────────

export function getTodayDateString(): string {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const year = parts.find((p) => p.type === 'year')!.value
  const month = parts.find((p) => p.type === 'month')!.value
  const day = parts.find((p) => p.type === 'day')!.value

  return `${year}-${month}-${day}`
}

export function getDaysSinceEpoch(dateStr: string): number {
  const target = parseUTCDate(dateStr)
  return Math.floor((target.getTime() - EPOCH.getTime()) / MS_PER_DAY)
}

export function getGameNumber(dateStr: string): number {
  return getDaysSinceEpoch(dateStr) + 1
}

export function formatGameNumber(dateStr: string): string {
  return `#${String(getGameNumber(dateStr)).padStart(3, '0')}`
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseUTCDate(dateStr)

  const weekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)

  const month = new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date)

  const day = date.getUTCDate()
  const year = date.getUTCFullYear()

  return `${weekday} ${day}${ordinal(day)} ${month} ${year}`
}

export function isPlayableDate(dateStr: string): boolean {
  const today = getTodayDateString()
  return dateStr >= LAUNCH_DATE && dateStr <= today
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString()
}

export function getArchiveDates(): string[] {
  const today = getTodayDateString()
  const dates: string[] = []
  const current = new Date(EPOCH)

  while (true) {
    const y = current.getUTCFullYear()
    const m = String(current.getUTCMonth() + 1).padStart(2, '0')
    const d = String(current.getUTCDate()).padStart(2, '0')
    const ds = `${y}-${m}-${d}`

    if (ds >= today) break
    dates.push(ds)
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates.reverse()
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
    // Only pair games with different prices
    if (a.launchPriceUsd !== b.launchPriceUsd) {
      pairs.push([a, b])
    }
    i += 2
  }

  return pairs
}
