// ---------------------------------------------------------------------------
// Street Date – localStorage helpers
// ---------------------------------------------------------------------------

export type Wager = 'low' | 'mid' | 'high'

export interface CoverAttempt {
  coverIndex: number
  yearGuessed: number
  skipped: boolean
}

export interface DayState {
  attempts: CoverAttempt[]
  won: boolean
  finished: boolean
  stars: number
  score: number
  currentCoverIndex: number
  wager: Wager
  wagerLocked: boolean
  guessHistory: number[]
}

export const STARTING_STARS = 0

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export const WAGER_MULT: Record<Wager, number> = {
  low: 0.5,
  mid: 1.0,
  high: 2.0,
}

export const STARTING_SCORE = 1000
export const WRONG_PENALTY_SD = 200
export const PTS_BY_ATTEMPT = [1000, 800, 600, 400, 200]

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

function storageKey(dateStr: string): string {
  return `street_date_${dateStr}`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function loadDayState(dateStr: string): DayState {
  const defaultState: DayState = {
    attempts: [],
    won: false,
    finished: false,
    stars: STARTING_STARS,
    score: 0,
    currentCoverIndex: 0,
    wager: 'mid',
    wagerLocked: false,
    guessHistory: [],
  }

  if (typeof window === 'undefined') return defaultState

  try {
    const raw = localStorage.getItem(storageKey(dateStr))
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    // Migrate old state without wager fields
    if (parsed.wager === undefined) {
      parsed.wager = 'mid'
      parsed.wagerLocked = parsed.attempts?.length > 0
      parsed.guessHistory = parsed.attempts
        ?.filter((a: CoverAttempt) => !a.skipped && a.yearGuessed > 0)
        .map((a: CoverAttempt) => a.yearGuessed) ?? []
    }
    return parsed as DayState
  } catch {
    return defaultState
  }
}

export function saveDayState(dateStr: string, state: DayState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(storageKey(dateStr), JSON.stringify(state))
  } catch {
    // Silently ignore storage errors
  }
}
