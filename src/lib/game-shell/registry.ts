// The per-game manifest registry — the single integration surface for the
// three daily games. Everything shared (badge shelf, today card, archive
// viewer, the upcoming Supabase badges sync) iterates these manifests instead
// of reaching into game folders. A new daily game ships by adding a manifest
// here plus its identity components under src/app/play/<slug>/.
//
// The persisted day-state shapes and their migrations live here too: they are
// the localStorage contract the shell owns (key prefixes must NEVER change —
// CLAUDE.md). The game storage modules re-export these stores.
//
// Note: share-text rows are NOT part of the manifest yet. Game Sense and
// Street Date could derive them from state alone, but Shelf Price needs the
// day's pair data (game identity), so the pages own share text until a
// shared consumer (e.g. server share-card generation) exists.

import { createDayStore, type DayStore } from './dayStore'
import { makeGameDates, type GameDates } from './gameDates'
import {
  getRankForGame,
  GAME_THEME,
  type DailyGameSlug,
  type GameTheme,
} from '@/lib/ranks'

// ── Persisted day-state shapes (localStorage contracts) ─────────────────────

export interface GameSenseGuessRecord {
  gameId: string
  proximity: number
  isHint?: boolean
}

export interface GameSenseDayState {
  guesses: GameSenseGuessRecord[]
  won: boolean
  score: number
  blanksRevealed: string[]
  /** Epoch ms when the player first loaded the puzzle */
  startedAt?: number
  /** Epoch ms when the game ended (won or lost) */
  endedAt?: number
  /** v2: lowest NON-HINT proximity so far — drives the box-art reveal.
   *  Revealed patches are DERIVED from this, never stored. */
  bestProximity?: number
  /** v2: paid spine hints (points buy facts; skill earns art). */
  spineHints?: { pattern: boolean; firstLetter: boolean }
}

export interface StreetDateGuess {
  order: string[]
  correctCount: number
  results: ('exact' | 'close' | 'wrong')[]
  score: number
}

export interface StreetDateDayState {
  gameIds: string[]
  shuffledIds: string[]
  slots: (string | null)[]
  pool: string[]
  guesses: StreetDateGuess[]
  score: number
  won: boolean
  finished: boolean
  hintOneUsed: boolean
  hintAllUsed: boolean
  /** Key is "gameId:slotIndex", value is the result at time of reveal */
  revealedPairs: Record<string, 'exact' | 'close' | 'wrong'>
  revealedYearIds: string[]
  startedAt: number | null
  endedAt: number | null
}

export interface ShelfPriceDayState {
  score: number
  correctCount: number
  round: number
  won: boolean
  finished: boolean
  choices: ('left' | 'right')[]
}

export interface StockRoomDayState {
  /** 9 cells, row-major; null while open. Placements are tentative until checked. */
  board: ({ gameId: string } | null)[]
  /** CHECK presses so far — the only scored action. */
  checks: number
  /** Per-cell verdict from the last check; a null entry = cell changed since
   *  (mark cleared). null overall = no check yet. */
  lastCheckResult: (boolean | null)[] | null
  finished: boolean
  /** Won = a check passed 9/9. Give-up is the only Bust. */
  won: boolean
  score: number
  /** Mean obscurity (0–100) of the correct answers — style, not competence. */
  rarity: number
  startedAt?: number
  endedAt?: number
}

export interface BoxSetDayState {
  /** Concept ids of solved groups, in solve order. */
  groupsSolved: string[]
  /** Every submitted guess: 4 tile (game) ids, in guess order. */
  guesses: string[][]
  mistakes: number
  finished: boolean
  won: boolean
  score: number
  startedAt?: number
  endedAt?: number
}

// ── Stores (key prefixes verbatim; migrations moved from the game modules) ──

export const gameSenseStore = createDayStore<GameSenseDayState>('game_sense_', (parsed) => {
  // Migrate old lifeline-based state to new blanks-based state
  const legacy = parsed as GameSenseDayState & { lifelinesUsed?: string[]; lifelinesRevealed?: unknown }
  if (legacy.lifelinesUsed && !legacy.blanksRevealed) {
    legacy.blanksRevealed = legacy.lifelinesUsed
    delete legacy.lifelinesUsed
    delete legacy.lifelinesRevealed
  }
  // v2 backfill: derive bestProximity for days saved before the box reveal
  // existed (lowest non-hint guess proximity).
  if (legacy.bestProximity === undefined && legacy.guesses?.length) {
    const nonHint = legacy.guesses.filter((g) => !g.isHint).map((g) => g.proximity)
    if (nonHint.length) legacy.bestProximity = Math.min(...nonHint)
  }
  return legacy
})

export const streetDateStore = createDayStore<StreetDateDayState>('street_date_v3_')

// Prefix FROZEN since the first Box Set commit.
export const boxSetStore = createDayStore<BoxSetDayState>('box_set_')

// Prefix FROZEN since the first Stock Room commit.
export const stockRoomStore = createDayStore<StockRoomDayState>('stock_room_', (parsed) => {
  // Migration: v1 (per-cell instant validation, misses) → v2 (arrange-then-
  // check). v1 existed for one playtest day pre-launch; convert rather than
  // discard so a finished day stays finished.
  const v1 = parsed as StockRoomDayState & {
    cells?: ({ gameId: string } | null)[]
    misses?: number
    guesses?: unknown[]
  }
  if (v1.board === undefined && v1.cells !== undefined) {
    v1.board = v1.cells
    v1.checks = v1.finished ? 1 : 0
    v1.lastCheckResult = null
    delete v1.cells
    delete v1.misses
    delete v1.guesses
  }
  return parsed
})

export const shelfPriceStore = createDayStore<ShelfPriceDayState>('shelf_price_v2_', (parsed) => {
  // Migration: add score if missing (old saves; 100 = wrong-answer penalty)
  if (parsed.score === undefined) {
    parsed.score = 1000 - ((parsed.choices?.length ?? 0) - (parsed.correctCount ?? 0)) * 100
    parsed.round = parsed.choices?.length ?? 0
  }
  return parsed
})

// ── Normalised day result ────────────────────────────────────────────────────

export interface DayResult {
  played: boolean
  /** Counts towards the badge shelf / today card. Game Sense only counts won
   *  days (a lost day shows "Not played"); the others count any finished day. */
  completed: boolean
  finished: boolean
  won: boolean
  score: number
  /** Shelf Price's correct-answer count; 0 for the others. */
  secondaryStat: number
  /** Rank name once finished (badge semantics), '' before. */
  rank: string
  /** Rank as the archive displays it (per-game gating preserved). */
  archiveRank: string
  /** Archive score column: "750 pts" / "8/10" / "Lost" / "In progress" / ''. */
  scoreDisplay: string
}

const NOT_PLAYED: DayResult = {
  played: false, completed: false, finished: false, won: false,
  score: 0, secondaryStat: 0, rank: '', archiveRank: '', scoreDisplay: '',
}

// ── Manifest ─────────────────────────────────────────────────────────────────

export interface DailyGameManifest<TState> {
  slug: DailyGameSlug
  label: string
  /** Small glyph used by TodayCard's completion slots. */
  emoji: string
  launchDate: string
  storageKeyPrefix: string
  dates: GameDates
  theme: GameTheme
  store: DayStore<TState>
  loadDayState(date: string): TState | null
  toDayResult(state: TState | null): DayResult
  playUrl(date: string): string
}

export const gameSenseManifest: DailyGameManifest<GameSenseDayState> = {
  slug: 'game-sense',
  label: 'Game Sense',
  emoji: '🎮',
  launchDate: '2026-02-22',
  storageKeyPrefix: 'game_sense_',
  dates: makeGameDates('2026-02-22'),
  theme: GAME_THEME['game-sense'],
  store: gameSenseStore,
  loadDayState: (date) => gameSenseStore.load(date),
  toDayResult(state) {
    if (!state) return NOT_PLAYED
    const played = state.guesses.length > 0
    const finished = state.won || state.score <= 0
    const rank = finished ? getRankForGame('game-sense', state.score, 0) : ''
    return {
      played,
      completed: state.won,
      finished,
      won: state.won,
      score: state.score,
      secondaryStat: 0,
      rank,
      archiveRank: state.won ? rank : '',
      scoreDisplay: !played ? '' : state.won ? `${state.score} pts` : finished ? 'Lost' : 'In progress',
    }
  },
  playUrl: (date) => `/play/game-sense/${date}`,
}

export const streetDateManifest: DailyGameManifest<StreetDateDayState> = {
  slug: 'street-date',
  label: 'Street Date',
  emoji: '📅',
  launchDate: '2026-02-22',
  storageKeyPrefix: 'street_date_v3_',
  dates: makeGameDates('2026-02-22'),
  theme: GAME_THEME['street-date'],
  store: streetDateStore,
  loadDayState: (date) => streetDateStore.load(date),
  toDayResult(state) {
    if (!state) return NOT_PLAYED
    const played = state.guesses.length > 0
    const rank = state.finished ? getRankForGame('street-date', state.score, 0) : ''
    return {
      played,
      completed: state.finished,
      finished: state.finished,
      won: state.won,
      score: state.score,
      secondaryStat: 0,
      rank,
      archiveRank: state.finished && state.won ? rank : '',
      scoreDisplay: !played ? '' : state.finished && state.won ? `${state.score} pts` : state.finished ? 'Lost' : 'In progress',
    }
  },
  playUrl: (date) => `/play/street-date/${date}`,
}

export const shelfPriceManifest: DailyGameManifest<ShelfPriceDayState> = {
  slug: 'shelf-price',
  label: 'Shelf Price',
  emoji: '💰',
  launchDate: '2026-03-03',
  storageKeyPrefix: 'shelf_price_v2_',
  dates: makeGameDates('2026-03-03'),
  theme: GAME_THEME['shelf-price'],
  store: shelfPriceStore,
  loadDayState: (date) => shelfPriceStore.load(date),
  toDayResult(state) {
    if (!state) return NOT_PLAYED
    const played = state.choices.length > 0
    const rank = state.finished ? getRankForGame('shelf-price', state.score, state.correctCount) : ''
    return {
      played,
      completed: state.finished,
      finished: state.finished,
      won: state.won,
      score: state.score,
      secondaryStat: state.correctCount,
      rank,
      archiveRank: rank,
      scoreDisplay: !played ? '' : state.finished ? `${state.correctCount}/10` : 'In progress',
    }
  },
  playUrl: (date) => `/play/shelf-price/${date}`,
}

export const boxSetManifest: DailyGameManifest<BoxSetDayState> = {
  slug: 'box-set',
  label: 'Box Set',
  emoji: '📦',
  // PROVISIONAL — first committed puzzle date; confirm before launch.
  launchDate: '2026-06-09',
  storageKeyPrefix: 'box_set_',
  dates: makeGameDates('2026-06-09'),
  theme: GAME_THEME['box-set'],
  store: boxSetStore,
  loadDayState: (date) => boxSetStore.load(date),
  toDayResult(state) {
    if (!state) return NOT_PLAYED
    const played = state.guesses.length > 0 || state.groupsSolved.length > 0
    const rank = state.finished ? getRankForGame('box-set', state.score, 0) : ''
    return {
      played,
      completed: state.finished,
      finished: state.finished,
      won: state.won,
      score: state.score,
      secondaryStat: state.mistakes,
      rank,
      archiveRank: rank,
      scoreDisplay: !played ? '' : state.finished ? (state.won ? `${state.score} pts` : 'Lost') : 'In progress',
    }
  },
  playUrl: (date) => `/play/box-set/${date}`,
}

export const stockRoomManifest: DailyGameManifest<StockRoomDayState> = {
  slug: 'stock-room',
  label: 'Stock Room',
  emoji: '🛒',
  // PROVISIONAL — confirm before launch.
  launchDate: '2026-06-11',
  storageKeyPrefix: 'stock_room_',
  dates: makeGameDates('2026-06-11'),
  theme: GAME_THEME['stock-room'],
  store: stockRoomStore,
  loadDayState: (date) => stockRoomStore.load(date),
  toDayResult(state) {
    if (!state) return NOT_PLAYED
    const played = state.checks > 0 || state.board.some(Boolean)
    const rank = state.finished ? getRankForGame('stock-room', state.score, 0) : ''
    return {
      played,
      completed: state.finished,
      finished: state.finished,
      // Won = a check passed 9/9. Give-up is the only Bust.
      won: state.won,
      score: state.score,
      secondaryStat: state.rarity,
      rank,
      archiveRank: rank,
      // v3 scoring: give-up banks the correct cells, so the score is always
      // meaningful once finished (0 = the give-up-with-nothing Bust).
      scoreDisplay: !played ? '' : state.finished ? `${state.score} pts` : 'In progress',
    }
  },
  playUrl: (date) => `/play/stock-room/${date}`,
}

// ── Registry ─────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
export const DAILY_GAMES: DailyGameManifest<any>[] = [
  gameSenseManifest,
  streetDateManifest,
  shelfPriceManifest,
  boxSetManifest,
  stockRoomManifest,
]

export const MANIFESTS: Record<DailyGameSlug, DailyGameManifest<any>> = {
  'game-sense': gameSenseManifest,
  'street-date': streetDateManifest,
  'shelf-price': shelfPriceManifest,
  'box-set': boxSetManifest,
  'stock-room': stockRoomManifest,
}
/* eslint-enable @typescript-eslint/no-explicit-any */
