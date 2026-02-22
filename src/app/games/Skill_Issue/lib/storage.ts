// ---------------------------------------------------------------------------
// Skill Issue – localStorage helpers
// ---------------------------------------------------------------------------

export interface GuessRecord {
  gameId: string;
  proximity: number;
}

export interface DayState {
  guesses: GuessRecord[];
  won: boolean;
  score: number;
  lifelinesUsed: string[];
  lifelinesRevealed: Record<string, string | number | boolean | string[]>;
}

export const STARTING_SCORE = 1000;

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

function storageKey(dateStr: string): string {
  return `skill_issue_${dateStr}`;
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
    score: STARTING_SCORE,
    lifelinesUsed: [],
    lifelinesRevealed: {},
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const raw = localStorage.getItem(storageKey(dateStr));
    if (!raw) return defaultState;
    const parsed: DayState = JSON.parse(raw);
    return parsed;
  } catch {
    return defaultState;
  }
}

/**
 * Persist the day's game state to localStorage.
 * No-ops silently during SSR.
 */
export function saveDayState(dateStr: string, state: DayState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(storageKey(dateStr), JSON.stringify(state));
  } catch {
    // Silently ignore storage errors (e.g. quota exceeded)
  }
}
