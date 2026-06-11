// Stock Room — scoring constants (TUNING — playtest will move these).
//
// v3 (playtest #2): score = CELL_POINTS × correct cells at final state
// (+CLEAN_BONUS if all 9), minus CHECK_PENALTY × (checks − 1), floor 0.
// A wrong or empty cell simply forfeits its points — no separate penalty,
// no completion gate. Bust = give-up with zero correct cells only.
// Holo unchanged: 9/9 on the first check = exactly 1000.
//
// KNOWN EXPLOIT: check-spam — cheap checks + cell-level red marking work as
// a binary search over candidates. First response is raising CHECK_PENALTY;
// second is count-only feedback ("7/9") with marking as a paid reveal.

/** FROZEN since the first Stock Room commit — changing it wipes progress. */
export const STORAGE_KEY_PREFIX = 'stock_room_'

export const CELL_COUNT = 9
export const CELL_POINTS = 111
/** All 9 correct adds this, making a perfect board exactly 1000. */
export const CLEAN_BONUS = 1
export const CHECK_PENALTY = 50

/** Score for a final state: correct cells + checks used (first is free). */
export function computeScore(correctCells: number, checks: number): number {
  const base =
    CELL_POINTS * correctCells + (correctCells === CELL_COUNT ? CLEAN_BONUS : 0)
  return Math.max(0, base - CHECK_PENALTY * Math.max(0, checks - 1))
}
