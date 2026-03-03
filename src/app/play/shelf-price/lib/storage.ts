// ---------------------------------------------------------------------------
// Shelf Price – localStorage helpers
// ---------------------------------------------------------------------------

export interface PriceGuess {
  /** Which guess this was (0-4) */
  guessIndex: number
  /** The dollar amount the player guessed, or 0 if skipped */
  priceGuessed: number
}

export interface DayState {
  guesses: PriceGuess[]
  won: boolean
  /** True when won OR all 5 guesses exhausted */
  finished: boolean
  /** 0-5 stars earned */
  stars: number
  /** stars x 100 */
  score: number
  /** Current guess being made (0-4) */
  currentGuessIndex: number
  /** Whether the year hint has been revealed */
  hintUsed: boolean
}

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

function storageKey(dateStr: string): string {
  return `shelf_price_${dateStr}`
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
    guesses: [],
    won: false,
    finished: false,
    stars: 0,
    score: 0,
    currentGuessIndex: 0,
    hintUsed: false,
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
