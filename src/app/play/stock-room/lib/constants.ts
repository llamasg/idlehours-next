// Stock Room — scoring constants (TUNING — playtest will move these).
//
// v2 (arrange-then-check): placements are free and rearrangeable; the only
// scored action is pressing CHECK. 1000 − CHECK_PENALTY × (checks − 1),
// floored at COMPLETED_FLOOR for any completed board. Bust = give-up only.

/** FROZEN since the first Stock Room commit — changing it wipes progress. */
export const STORAGE_KEY_PREFIX = 'stock_room_'

export const CELL_COUNT = 9
export const MAX_SCORE = 1000
export const CHECK_PENALTY = 250
/** Any board that eventually checks out 9/9 scores at least this. */
export const COMPLETED_FLOOR = 250

/** Score for a board that passed on its Nth check (checks ≥ 1). */
export function computeScore(checks: number): number {
  return Math.max(COMPLETED_FLOOR, MAX_SCORE - CHECK_PENALTY * (checks - 1))
}
