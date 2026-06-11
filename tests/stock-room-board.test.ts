// Stock Room board generation — the refactor/data contract, house pattern.
// Pins axes + per-cell valid counts across 14 dates. If a snapshot changes,
// either generation changed (revert) or GAMES_DB changed deliberately
// (update snapshot in the same commit, explained).

import { describe, it, expect } from 'vitest'
import {
  generateBoard,
  solveBoard,
  gameFitsCell,
  boardCellCandidates,
  recognisableCount,
  isBlockedPair,
  MIN_CELL_ANSWERS,
  RECOGNISABLE_FLOOR,
} from '@/app/play/stock-room/lib/boardGen'
import { GAMES_DB } from '@/data/games-db'

const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date('2026-06-15T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + i)
  return d.toISOString().slice(0, 10)
})

describe('stock-room board generation', () => {
  it('generates the same board per date (axes + cell counts)', () => {
    const result = Object.fromEntries(
      DATES.map((date) => {
        const board = generateBoard(date)
        return [
          date,
          {
            rows: board.rows.map((c) => c.id),
            cols: board.cols.map((c) => c.id),
            cellCounts: board.cellCounts,
          },
        ]
      }),
    )
    expect(result).toMatchSnapshot()
  })

  it('every cell on every board meets the solvability + quality floors', () => {
    for (const date of DATES) {
      const board = generateBoard(date)
      expect(Math.min(...board.cellCounts)).toBeGreaterThanOrEqual(MIN_CELL_ANSWERS)
      for (let cell = 0; cell < 9; cell++) {
        expect(
          recognisableCount(boardCellCandidates(board, cell)),
        ).toBeGreaterThanOrEqual(RECOGNISABLE_FLOOR)
        expect(
          isBlockedPair(board.rows[Math.floor(cell / 3)].id, board.cols[cell % 3].id),
        ).toBe(false)
      }
    }
  })

  it('solveBoard completes every board: 9 distinct valid answers, fixed cells kept', () => {
    const byId = new Map(GAMES_DB.map((g) => [g.id, g]))
    for (const date of DATES) {
      const board = generateBoard(date)
      const full = solveBoard(board, Array(9).fill(null))
      expect(full).not.toBeNull()
      expect(new Set(full!).size).toBe(9)
      full!.forEach((id, cell) => expect(gameFitsCell(board, cell, byId.get(id)!)).toBe(true))

      // Constrain two cells with answers known-valid for those cells.
      const fixed = Array(9).fill(null)
      fixed[2] = { gameId: full![2] }
      fixed[6] = { gameId: full![6] }
      const constrained = solveBoard(board, fixed)
      expect(constrained).not.toBeNull()
      expect(constrained![2]).toBe(full![2])
      expect(constrained![6]).toBe(full![6])
      expect(new Set(constrained!).size).toBe(9)
      constrained!.forEach((id, cell) => expect(gameFitsCell(board, cell, byId.get(id)!)).toBe(true))
    }
  })

  it('variety rules hold: ≥3 types, ≤2 per type per side, no duplicate axes', () => {
    for (const date of DATES) {
      const board = generateBoard(date)
      const all = [...board.rows, ...board.cols]
      expect(new Set(all.map((c) => c.id)).size).toBe(6)
      expect(new Set(all.map((c) => c.type)).size).toBeGreaterThanOrEqual(3)
      for (const side of [board.rows, board.cols]) {
        const counts: Record<string, number> = {}
        for (const c of side) counts[c.type] = (counts[c.type] ?? 0) + 1
        expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(2)
      }
    }
  })
})
