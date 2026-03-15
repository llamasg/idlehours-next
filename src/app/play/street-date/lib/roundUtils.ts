// src/app/play/street-date/lib/roundUtils.ts
// Street Date — round-level helpers (full pool cycling)

import { GAMES, type StreetDateGame } from '../data/games'

/**
 * Deterministic seeded shuffle using a simple LCG PRNG.
 * Same seed always produces the same order.
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Return 5 games for a given year and cycle number.
 *
 * Games are shuffled deterministically per year+cycle, then 5 are
 * picked at spread-out positions. This ensures each 36-day cycle
 * shows different games for the same year.
 *
 * @param year - The answer year
 * @param cycle - How many times we've looped through all years (0-indexed)
 */
export function getGamesForYear(year: number, cycle: number = 0): StreetDateGame[] {
  const yearGames = GAMES
    .filter(g => g.year === year)
    .sort((a, b) => a.popularityRank - b.popularityRank)

  if (yearGames.length === 0) return []
  if (yearGames.length <= 5) return yearGames

  // Shuffle deterministically per year+cycle so each cycle shows different games
  const shuffled = seededShuffle(yearGames, year * 7919 + cycle * 104729)

  // Pick 5 at spread-out positions
  const step = shuffled.length / 5
  const picked: StreetDateGame[] = []
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(i * step) % shuffled.length
    picked.push(shuffled[idx])
  }

  // Sort picked by popularityRank descending (obscure first, iconic last) for reveal order
  return picked.sort((a, b) => b.popularityRank - a.popularityRank)
}
