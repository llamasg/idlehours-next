// ---------------------------------------------------------------------------
// Street Date – localStorage helpers
// ---------------------------------------------------------------------------

export interface CoverAttempt {
  /** Which cover was shown (0-4, matching popularityRank order) */
  coverIndex: number
  /** The year the player guessed, or 0 if skipped */
  yearGuessed: number
  /** True if the player skipped this cover */
  skipped: boolean
}

export interface DayState {
  attempts: CoverAttempt[]
  won: boolean
  /** True when won OR all 5 covers exhausted */
  finished: boolean
  /** 0-5 stars earned */
  stars: number
  /** stars x 100 */
  score: number
  /** Current cover being shown (0-4) */
  currentCoverIndex: number
}

export const STARTING_STARS = 0

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

function storageKey(dateStr: string): string {
  return `street_date_${dateStr}`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load the day's game state from localStorage.
 * Returns a fresh default state when running on the server (SSR),
 * when no entry exists, or when the stored value is corrupted.
 */
export function loadDayState(dateStr: string): DayState {
  const defaultState: DayState = {
    attempts: [],
    won: false,
    finished: false,
    stars: STARTING_STARS,
    score: 0,
    currentCoverIndex: 0,
  }

  if (typeof window === 'undefined') return defaultState

  try {
    const raw = localStorage.getItem(storageKey(dateStr))
    if (!raw) return defaultState
    const parsed: DayState = JSON.parse(raw)
    return parsed
  } catch {
    return defaultState
  }
}

/**
 * Persist the day's game state to localStorage.
 * No-ops silently during SSR.
 */
export function saveDayState(dateStr: string, state: DayState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(storageKey(dateStr), JSON.stringify(state))
  } catch {
    // Silently ignore storage errors (e.g. quota exceeded)
  }
}
