// ---------------------------------------------------------------------------
// Shelf Price – localStorage helpers (state shape + store live in the
// game-shell registry; this module binds them with the game's defaults)
// ---------------------------------------------------------------------------

import { shelfPriceStore, type ShelfPriceDayState } from '@/lib/game-shell/registry'

export type DayState = ShelfPriceDayState

export const WRONG_PENALTY = 100
export const TARGET_ROUNDS = 10

export function loadDayState(dateStr: string): DayState {
  return (
    shelfPriceStore.load(dateStr) ?? {
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
  shelfPriceStore.save(dateStr, state)
}
