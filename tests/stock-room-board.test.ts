// Stock Room board generation — the refactor/data contract, house pattern.
// Pins axes + per-cell valid counts across 14 dates. If a snapshot changes,
// either generation changed (revert) or GAMES_DB changed deliberately
// (update snapshot in the same commit, explained).

import { describe, it, expect } from 'vitest'
import { generateBoard, MIN_CELL_ANSWERS } from '@/app/play/stock-room/lib/boardGen'

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

  it('every cell on every board meets the solvability floor', () => {
    for (const date of DATES) {
      const board = generateBoard(date)
      expect(Math.min(...board.cellCounts)).toBeGreaterThanOrEqual(MIN_CELL_ANSWERS)
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
