// ---------------------------------------------------------------------------
// Game Sense – localStorage helpers (state shape + store live in the
// game-shell registry; this module binds them with the game's defaults)
// ---------------------------------------------------------------------------

import {
  gameSenseStore,
  type GameSenseDayState,
  type GameSenseGuessRecord,
} from '@/lib/game-shell/registry'

export type DayState = GameSenseDayState
export type GuessRecord = GameSenseGuessRecord

const STARTING_SCORE = 1000;

export function loadDayState(dateStr: string): DayState {
  return (
    gameSenseStore.load(dateStr) ?? {
      guesses: [],
      won: false,
      score: STARTING_SCORE,
      blanksRevealed: [],
    }
  );
}

export function saveDayState(dateStr: string, state: DayState): void {
  gameSenseStore.save(dateStr, state);
}
