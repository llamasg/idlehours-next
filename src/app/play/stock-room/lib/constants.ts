// Stock Room — scoring constants (TUNING — playtest will move these).

/** FROZEN since the first Stock Room commit — changing it wipes progress. */
export const STORAGE_KEY_PREFIX = 'stock_room_'

export const CELL_POINTS = 111
/** All 9 filled adds this, making a clean board exactly 1000. */
export const CLEAN_BONUS = 1
export const MISS_PENALTY = 50
export const CELL_COUNT = 9

export function computeScore(filledCells: number, misses: number): number {
  const base = CELL_POINTS * filledCells + (filledCells === CELL_COUNT ? CLEAN_BONUS : 0)
  return Math.max(0, base - MISS_PENALTY * misses)
}
