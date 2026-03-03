// src/app/play/street-date/lib/roundUtils.ts
// Street Date — round-level helpers

import { GAMES, type StreetDateGame } from '../data/games'

/**
 * Return the 5 games for a given year, sorted by popularityRank
 * (1 = most obscure shown first, 5 = most iconic shown last).
 *
 * If the year has more than 5 games in the database, only the first 5
 * by popularityRank are returned.
 */
export function getGamesForYear(year: number): StreetDateGame[] {
  return GAMES
    .filter(g => g.year === year)
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, 5)
}
