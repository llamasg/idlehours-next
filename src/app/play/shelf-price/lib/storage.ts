// ---------------------------------------------------------------------------
// Shelf Price – localStorage helpers (higher-or-lower version)
// ---------------------------------------------------------------------------

export interface DayState {
  score: number
  streak: number
  round: number
  won: boolean
  finished: boolean
  choices: ('left' | 'right')[]
}

export const WRONG_PENALTY = 100
export const TARGET_ROUNDS = 10

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

function storageKey(dateStr: string): string {
  return `shelf_price_v2_${dateStr}`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function loadDayState(dateStr: string): DayState {
  const defaultState: DayState = {
    score: 1000,
    streak: 0,
    round: 0,
    won: false,
    finished: false,
    choices: [],
  }

  if (typeof window === 'undefined') return defaultState

  try {
    const raw = localStorage.getItem(storageKey(dateStr))
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as DayState
    // Migration: add score if missing (old saves)
    if (parsed.score === undefined) {
      parsed.score = 1000 - ((parsed.choices?.length ?? 0) - (parsed.streak ?? 0)) * WRONG_PENALTY
      parsed.round = parsed.choices?.length ?? 0
    }
    return parsed
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
