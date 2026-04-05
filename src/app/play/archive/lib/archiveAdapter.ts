// Unified archive data adapter — normalizes all 3 daily games into a common shape.

import { type GameSlug, getRankForGame } from '@/lib/ranks'

// Game Sense
import {
  getArchiveDates as gsArchiveDates,
  formatGameNumber as gsFormatNumber,
  formatDisplayDate as gsFormatDisplay,
  LAUNCH_DATE as GS_LAUNCH,
} from '@/app/play/game-sense/lib/dateUtils'
import { loadDayState as gsLoadState } from '@/app/play/game-sense/lib/storage'

// Street Date
import {
  getArchiveDates as sdArchiveDates,
  formatGameNumber as sdFormatNumber,
  formatDisplayDate as sdFormatDisplay,
  LAUNCH_DATE as SD_LAUNCH,
} from '@/app/play/street-date/lib/dateUtils'
import { loadState as sdLoadStateRaw } from '@/app/play/street-date/lib/gameState'

// Shelf Price
import {
  getArchiveDates as spArchiveDates,
  formatGameNumber as spFormatNumber,
  formatDisplayDate as spFormatDisplay,
  LAUNCH_DATE as SP_LAUNCH,
} from '@/app/play/shelf-price/lib/dateUtils'
import { loadDayState as spLoadState } from '@/app/play/shelf-price/lib/storage'

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
  slug: GameSlug
  label: string
  launchDate: string
  playUrl: (date: string) => string
}

export const GAME_CONFIGS: GameConfig[] = [
  { slug: 'game-sense',  label: 'Game Sense',  launchDate: GS_LAUNCH, playUrl: (d) => `/play/game-sense/${d}` },
  { slug: 'street-date', label: 'Street Date', launchDate: SD_LAUNCH, playUrl: (d) => `/play/street-date/${d}` },
  { slug: 'shelf-price', label: 'Shelf Price', launchDate: SP_LAUNCH, playUrl: (d) => `/play/shelf-price/${d}` },
]

// ── Adapter ──────────────────────────────────────────────────────────────────

export function getArchiveForGame(slug: GameSlug): ArchiveEntry[] {
  switch (slug) {
    case 'game-sense': {
      const dates = gsArchiveDates()
      return dates.map((date) => {
        const state = gsLoadState(date)
        const played = state.guesses.length > 0
        const finished = state.won || state.score <= 0
        const won = state.won
        const score = state.score
        const rank = won ? getRankForGame('game-sense', score, 0) : ''
        const scoreDisplay = !played ? '' : won ? `${score} pts` : finished ? 'Lost' : 'In progress'
        return { date, gameNumber: gsFormatNumber(date), displayDate: gsFormatDisplay(date), played, finished, won, score, streak: 0, rank, scoreDisplay }
      })
    }

    case 'street-date': {
      const dates = sdArchiveDates()
      return dates.map((date) => {
        const state = sdLoadStateRaw(date)
        const played = state ? state.guesses.length > 0 : false
        const finished = state?.finished ?? false
        const won = state?.won ?? false
        const score = state?.score ?? 0
        const rank = finished && won ? getRankForGame('street-date', score, 0) : ''
        const scoreDisplay = !played ? '' : finished && won ? `${score} pts` : finished ? 'Lost' : 'In progress'
        return { date, gameNumber: sdFormatNumber(date), displayDate: sdFormatDisplay(date), played, finished, won, score, streak: 0, rank, scoreDisplay }
      })
    }

    case 'shelf-price': {
      const dates = spArchiveDates()
      return dates.map((date) => {
        const state = spLoadState(date)
        const played = state.choices.length > 0
        const finished = state.finished
        const won = state.won
        const score = state.score
        const streak = state.correctCount
        const rank = finished ? getRankForGame('shelf-price', score, streak) : ''
        const scoreDisplay = !played ? '' : finished ? `${streak}/10` : 'In progress'
        return { date, gameNumber: spFormatNumber(date), displayDate: spFormatDisplay(date), played, finished, won, score, streak, rank, scoreDisplay }
      })
    }
  }
}
