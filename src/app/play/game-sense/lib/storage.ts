// ---------------------------------------------------------------------------
// Game Sense – localStorage helpers
// ---------------------------------------------------------------------------

export interface GuessRecord {
  gameId: string;
  proximity: number;
}

export interface DayState {
  guesses: GuessRecord[];
  won: boolean;
  score: number;
  blanksRevealed: string[];
}

export const STARTING_SCORE = 1000;

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

function storageKey(dateStr: string): string {
  return `game_sense_${dateStr}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function loadDayState(dateStr: string): DayState {
  const defaultState: DayState = {
    guesses: [],
    won: false,
    score: STARTING_SCORE,
    blanksRevealed: [],
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const raw = localStorage.getItem(storageKey(dateStr));
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    // Migrate old lifeline-based state to new blanks-based state
    if (parsed.lifelinesUsed && !parsed.blanksRevealed) {
      parsed.blanksRevealed = parsed.lifelinesUsed;
      delete parsed.lifelinesUsed;
      delete parsed.lifelinesRevealed;
    }
    return parsed as DayState;
  } catch {
    return defaultState;
  }
}

export function saveDayState(dateStr: string, state: DayState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(storageKey(dateStr), JSON.stringify(state));
  } catch {
    // Silently ignore storage errors (e.g. quota exceeded)
  }
}
