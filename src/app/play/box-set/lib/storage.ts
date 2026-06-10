// ---------------------------------------------------------------------------
// Box Set – localStorage helpers (state shape + store live in the
// game-shell registry; this module binds them with the game's defaults)
// ---------------------------------------------------------------------------

import { boxSetStore, type BoxSetDayState } from '@/lib/game-shell/registry'
import { BASE_SCORE } from './constants'

export type DayState = BoxSetDayState

export function loadDayState(dateStr: string): DayState {
  return (
    boxSetStore.load(dateStr) ?? {
      groupsSolved: [],
      guesses: [],
      mistakes: 0,
      finished: false,
      won: false,
      score: BASE_SCORE,
    }
  )
}

export function saveDayState(dateStr: string, state: DayState): void {
  boxSetStore.save(dateStr, state)
}
