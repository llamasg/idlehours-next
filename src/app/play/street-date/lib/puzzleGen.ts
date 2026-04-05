import { GAMES, type StreetDateGame } from '../data/games'

// ── Named constants ──────────────────────────────────────────────────────────
const YEAR_MIN = 1992
const YEAR_MAX = 2024
const MAX_GENERATION_ATTEMPTS = 20
const CLUSTER_CENTER_START = 2000
const CLUSTER_CENTER_RANGE = 19
const CLUSTER_VARIANCE = 3
const MIN_YEAR_SPREAD = 20
const POPULARITY_TIERS = [
  { min: 1, max: 30 },   // popular — 2 games
  { min: 1, max: 30 },   // popular
  { min: 31, max: 80 },  // mid — 3 games
  { min: 31, max: 80 },  // mid
  { min: 31, max: 80 },  // mid
  { min: 81, max: 999 }, // obscure — 2 games
  { min: 81, max: 999 }, // obscure
]

// Reuse the existing seeded shuffle LCG
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

function seededRandom(seed: number): { value: number; next: number } {
  const next = (seed * 1664525 + 1013904223) & 0x7fffffff
  return { value: next / 0x7fffffff, next }
}

function dateToSeed(dateStr: string): number {
  // Simple hash from date string
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) & 0x7fffffff
  }
  return hash || 1
}

const HAS_YEAR_IN_TITLE = /\b(19|20)\d{2}\b/

interface PuzzleResult {
  games: StreetDateGame[]  // 7 games in correct chronological order
  shuffled: StreetDateGame[] // same 7 games in random order for initial display
}

export function generatePuzzle(dateStr: string): PuzzleResult {
  let seed = dateToSeed(dateStr)

  // Group eligible games by year
  const byYear = new Map<number, StreetDateGame[]>()
  for (const g of GAMES) {
    if (!g.igdbImageId) continue
    const list = byYear.get(g.year) || []
    list.push(g)
    byYear.set(g.year, list)
  }

  // Available years (must have at least 1 game)
  const availableYears = [...byYear.keys()].filter(y => y >= YEAR_MIN && y <= YEAR_MAX).sort()

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
    const picked = pickYearsAndGames(seed, availableYears, byYear)
    if (picked) {
      // Sort by year for correct order
      const sorted = [...picked].sort((a, b) => a.year - b.year)
      const shuffled = seededShuffle([...sorted], seed * 31 + 7)
      return { games: sorted, shuffled }
    }
  }

  // Fallback: just grab 7 random games with unique years
  const fallback = seededShuffle([...GAMES].filter(g => g.igdbImageId), seed)
  const seen = new Set<number>()
  const result: StreetDateGame[] = []
  for (const g of fallback) {
    if (seen.has(g.year)) continue
    seen.add(g.year)
    result.push(g)
    if (result.length === 7) break
  }
  const sorted = result.sort((a, b) => a.year - b.year)
  return { games: sorted, shuffled: seededShuffle([...sorted], seed * 31 + 7) }
}

function pickYearsAndGames(
  seed: number,
  availableYears: number[],
  byYear: Map<number, StreetDateGame[]>
): StreetDateGame[] | null {
  let s = seed

  // Step 1: Pick 7 unique years with constraints
  // - Total spread >= 20 years
  // - 2-3 games within 3-5 years of each other (tricky cluster)
  // Strategy: pick an anchor range for the cluster, then fill the rest spread out

  // Pick cluster center year (2000-2018 for good game density)
  const r1 = seededRandom(s); s = r1.next
  const clusterCenter = CLUSTER_CENTER_START + Math.floor(r1.value * CLUSTER_CENTER_RANGE)

  // Pick 3 years within ±3 of cluster center (all unique)
  const clusterYears: number[] = []
  const clusterCandidates = availableYears.filter(y => Math.abs(y - clusterCenter) <= CLUSTER_VARIANCE)
  const shuffledCluster = seededShuffle(clusterCandidates, s)
  s = (s * 1664525 + 1013904223) & 0x7fffffff
  for (const y of shuffledCluster) {
    if (clusterYears.length >= 3) break
    if (!clusterYears.includes(y)) clusterYears.push(y)
  }
  if (clusterYears.length < 2) return null // not enough cluster years

  // Pick remaining years spread across the full range, avoiding cluster
  const usedYears = new Set(clusterYears)
  const remainingNeeded = 7 - clusterYears.length
  const spreadCandidates = availableYears.filter(y => !usedYears.has(y))
  const shuffledSpread = seededShuffle(spreadCandidates, s)
  s = (s * 1664525 + 1013904223) & 0x7fffffff

  const spreadYears: number[] = []
  for (const y of shuffledSpread) {
    if (spreadYears.length >= remainingNeeded) break
    spreadYears.push(y)
    usedYears.add(y)
  }

  if (spreadYears.length < remainingNeeded) return null

  const allYears = [...clusterYears, ...spreadYears].sort()
  const totalSpread = allYears[allYears.length - 1] - allYears[0]
  if (totalSpread < MIN_YEAR_SPREAD) return null

  // Step 2: Pick one game per year with popularity distribution
  // Desired: 2 popular (rank 1-30), 3 mid (31-80), 2 obscure (81+)
  const tierTargets = [...POPULARITY_TIERS]
  // Shuffle tier assignments so popular/obscure slots aren't predictable
  const shuffledTiers = seededShuffle(tierTargets, s)
  s = (s * 1664525 + 1013904223) & 0x7fffffff

  const pickedGames: StreetDateGame[] = []

  for (let i = 0; i < allYears.length; i++) {
    const year = allYears[i]
    const tier = shuffledTiers[i]
    const yearGames = byYear.get(year) || []

    // Try to find a game in the target tier
    let candidates = yearGames.filter(g => g.popularityRank >= tier.min && g.popularityRank <= tier.max)
    if (candidates.length === 0) {
      // Fall back to any game from this year
      candidates = yearGames
    }
    if (candidates.length === 0) return null

    const shuffledCandidates = seededShuffle(candidates, s + year)
    pickedGames.push(shuffledCandidates[0])
  }

  // Validate: no more than 2 games with year in title
  const yearInTitle = pickedGames.filter(g => HAS_YEAR_IN_TITLE.test(g.title))
  if (yearInTitle.length > 2) return null

  return pickedGames
}
