// Stock Room — rarity: the style stat (score measures competence).
//
// obscurity(game) maps popularityRank into 0–100 by POPULATION PERCENTILE,
// not linearly by rank value: the rank distribution is lumpy (values 1–213
// with heavy ties — p50 ≈ 60), so value-linear mapping would call a
// median-popularity game "28/100 obscure". Percentile reads correctly:
// obscurity 80 = "less famous than 80% of the library."
// Ties take the midpoint of their span so equal ranks get equal obscurity.
//
// rarity(board) = mean obscurity of the filled answers, rounded.

import { GAMES_DB } from '@/data/games-db'

const sortedRanks = GAMES_DB
  .map((g) => g.popularityRank)
  .filter((r): r is number => r !== null)
  .sort((a, b) => a - b)

const N = sortedRanks.length

function lowerBound(target: number): number {
  let lo = 0, hi = N
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sortedRanks[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
}

function upperBound(target: number): number {
  let lo = 0, hi = N
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sortedRanks[mid] <= target) lo = mid + 1
    else hi = mid
  }
  return lo
}

/** 0 (most famous) … 100 (deepest cut), by population percentile. */
export function obscurity(popularityRank: number | null): number {
  if (popularityRank === null) return 50
  const below = lowerBound(popularityRank)
  const ties = upperBound(popularityRank) - below
  return Math.round(((below + ties / 2) / N) * 100)
}

/** Mean obscurity of the answered games, rounded; 0 for an empty board. */
export function boardRarity(gameIds: string[]): number {
  if (gameIds.length === 0) return 0
  const byId = new Map(GAMES_DB.map((g) => [g.id, g]))
  const values = gameIds.map((id) => obscurity(byId.get(id)?.popularityRank ?? null))
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}
