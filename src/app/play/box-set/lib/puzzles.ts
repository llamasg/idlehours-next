// Box Set puzzle access — reads the committed, human-reviewed puzzle data.
// There is deliberately NO fallback generation: a date without a committed
// puzzle renders the "no puzzle yet" state (distinct from PlayableGuard's
// future-date case). Coverage is maintained by scripts/assemble-box-set.mjs;
// tests warn when fewer than 14 days remain.

import puzzlesJson from '../data/puzzles/puzzles.json'
import type { ConceptTier } from './conceptBank'

export interface PuzzleGroup {
  conceptId: string
  tier: ConceptTier
  label: string
  gameIds: string[]
}

export interface PuzzleTile {
  id: string
  title: string
}

export interface BoxSetPuzzle {
  date: string
  groups: PuzzleGroup[]
  /** 16 tiles in the committed display order (same shuffle for everyone). */
  tiles: PuzzleTile[]
}

export const PUZZLES: Record<string, BoxSetPuzzle> = puzzlesJson as Record<string, BoxSetPuzzle>

export function getPuzzleForDate(dateStr: string): BoxSetPuzzle | null {
  return PUZZLES[dateStr] ?? null
}

export function latestPuzzleDate(): string | null {
  const dates = Object.keys(PUZZLES).sort()
  return dates[dates.length - 1] ?? null
}
