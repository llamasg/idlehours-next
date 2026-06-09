// ---------------------------------------------------------------------------
// Shelf Price – localStorage helpers (higher-or-lower version)
// ---------------------------------------------------------------------------

import { createDayStore } from '@/lib/game-shell/dayStore'

export interface DayState {
  score: number
  correctCount: number
  round: number
  won: boolean
  finished: boolean
  choices: ('left' | 'right')[]
}

export const WRONG_PENALTY = 100
export const TARGET_ROUNDS = 10

const store = createDayStore<DayState>('shelf_price_v2_', (parsed) => {
  // Migration: add score if missing (old saves)
  if (parsed.score === undefined) {
    parsed.score = 1000 - ((parsed.choices?.length ?? 0) - (parsed.correctCount ?? 0)) * WRONG_PENALTY
    parsed.round = parsed.choices?.length ?? 0
  }
  return parsed
})

export function loadDayState(dateStr: string): DayState {
  return (
    store.load(dateStr) ?? {
      score: 1000,
      correctCount: 0,
      round: 0,
      won: false,
      finished: false,
      choices: [],
    }
  )
}

export function saveDayState(dateStr: string, state: DayState): void {
  store.save(dateStr, state)
}
