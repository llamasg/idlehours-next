// ---------------------------------------------------------------------------
// Stock Room – localStorage helpers (state shape + store live in the
// game-shell registry; this module binds them with the game's defaults)
// ---------------------------------------------------------------------------

import { stockRoomStore, type StockRoomDayState } from '@/lib/game-shell/registry'
import { CELL_COUNT } from './constants'

export type DayState = StockRoomDayState

export function loadDayState(dateStr: string): DayState {
  return (
    stockRoomStore.load(dateStr) ?? {
      cells: Array(CELL_COUNT).fill(null),
      misses: 0,
      guesses: [],
      finished: false,
      won: false,
      score: 0,
      rarity: 0,
    }
  )
}

export function saveDayState(dateStr: string, state: DayState): void {
  stockRoomStore.save(dateStr, state)
}
