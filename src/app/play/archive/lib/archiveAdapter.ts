// Unified archive data adapter — a thin view over the game-shell manifest
// registry. Previously this file reached into each game's lib/ folder; the
// registry is now the only integration surface.

import { formatDisplayDate } from '@/lib/dateUtils'
import { DAILY_GAMES, MANIFESTS } from '@/lib/game-shell/registry'
import { type DailyGameSlug } from '@/lib/ranks'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ArchiveEntry {
  date: string           // YYYY-MM-DD
  gameNumber: string     // "#001"
  displayDate: string    // "Sun 22nd Feb 2026"
  played: boolean
  finished: boolean
  won: boolean
  score: number
  streak: number         // shelf-price only, 0 for others
  rank: string
  scoreDisplay: string   // "750 pts" / "8/10" / "Lost"
}

export interface GameConfig {
  slug: DailyGameSlug
  label: string
  launchDate: string
  playUrl: (date: string) => string
}

export const GAME_CONFIGS: GameConfig[] = DAILY_GAMES.map((m) => ({
  slug: m.slug,
  label: m.label,
  launchDate: m.launchDate,
  playUrl: m.playUrl,
}))

// ── Adapter ──────────────────────────────────────────────────────────────────

export function getArchiveForGame(slug: DailyGameSlug): ArchiveEntry[] {
  const manifest = MANIFESTS[slug]
  return manifest.dates.getArchiveDates().map((date) => {
    const result = manifest.toDayResult(manifest.loadDayState(date))
    return {
      date,
      gameNumber: manifest.dates.formatGameNumber(date),
      displayDate: formatDisplayDate(date),
      played: result.played,
      finished: result.finished,
      won: result.won,
      score: result.score,
      streak: result.secondaryStat,
      rank: result.archiveRank,
      scoreDisplay: result.scoreDisplay,
    }
  })
}
