// ---------------------------------------------------------------------------
// Game Sense – localStorage helpers
// ---------------------------------------------------------------------------

import { createDayStore } from '@/lib/game-shell/dayStore'

export interface GuessRecord {
  gameId: string;
  proximity: number;
  isHint?: boolean;
}

export interface DayState {
  guesses: GuessRecord[];
  won: boolean;
  score: number;
  blanksRevealed: string[];
  /** Epoch ms when the player first loaded the puzzle */
  startedAt?: number;
  /** Epoch ms when the game ended (won or lost) */
  endedAt?: number;
}

const STARTING_SCORE = 1000;

const store = createDayStore<DayState>('game_sense_', (parsed) => {
  // Migrate old lifeline-based state to new blanks-based state
  const legacy = parsed as DayState & { lifelinesUsed?: string[]; lifelinesRevealed?: unknown };
  if (legacy.lifelinesUsed && !legacy.blanksRevealed) {
    legacy.blanksRevealed = legacy.lifelinesUsed;
    delete legacy.lifelinesUsed;
    delete legacy.lifelinesRevealed;
  }
  return legacy;
});

export function loadDayState(dateStr: string): DayState {
  return (
    store.load(dateStr) ?? {
      guesses: [],
      won: false,
      score: STARTING_SCORE,
      blanksRevealed: [],
    }
  );
}

export function saveDayState(dateStr: string, state: DayState): void {
  store.save(dateStr, state);
}
