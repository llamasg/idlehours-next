// Stock Room — deterministic daily board generation.
//
// 3 row criteria × 3 column criteria, seeded per date (Europe/London day
// boundary upstream). Variety rules: the 6 axes span ≥3 criterion types,
// no type appears more than twice per side, no duplicate criterion on the
// board. Solvability rules: every cell has ≥ MIN_CELL_ANSWERS valid games,
// AND a full no-reuse assignment exists (9 distinct games can fill the
// board — greedy over ascending candidate counts with seeded retries).
//
// NOTE (same caveat as the other dailies, pre-launch acceptable): boards
// derive from GAMES_DB contents, so db edits can change past boards. The
// snapshot tests pin outputs.

import { GAMES_DB, type GameEntry } from '@/data/games-db'
import { mulberry32, hashDateSeed } from '@/lib/game-shell/seededRng'
import { CRITERIA, type Criterion } from './criteria'

export const MIN_CELL_ANSWERS = 15
const BOARD_ATTEMPTS = 400
const ASSIGNMENT_RETRIES = 25
const MIN_TYPE_SPREAD = 3
const MAX_PER_TYPE_PER_SIDE = 2

export interface Board {
  date: string
  rows: Criterion[]
  cols: Criterion[]
  /** Valid-answer count per cell (row-major: cell = row * 3 + col). */
  cellCounts: number[]
}

// Precomputed per-criterion match sets (indices into GAMES_DB) — keeps the
// re-roll loop cheap.
const MATCH_SETS: Map<string, Set<number>> = new Map(
  CRITERIA.map((c) => [
    c.id,
    new Set(GAMES_DB.map((g, i) => (c.test(g) ? i : -1)).filter((i) => i !== -1)),
  ]),
)

function cellCandidates(row: Criterion, col: Criterion): number[] {
  const a = MATCH_SETS.get(row.id)!
  const b = MATCH_SETS.get(col.id)!
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  const out: number[] = []
  for (const i of small) if (large.has(i)) out.push(i)
  return out
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function varietyOk(rows: Criterion[], cols: Criterion[]): boolean {
  const types = new Set([...rows, ...cols].map((c) => c.type))
  if (types.size < MIN_TYPE_SPREAD) return false
  for (const side of [rows, cols]) {
    const counts = new Map<string, number>()
    for (const c of side) counts.set(c.type, (counts.get(c.type) ?? 0) + 1)
    if ([...counts.values()].some((n) => n > MAX_PER_TYPE_PER_SIDE)) return false
  }
  return true
}

/** A full no-reuse assignment exists: 9 DISTINCT games can fill the board. */
function assignmentExists(cells: number[][], rng: () => number): boolean {
  const order = cells
    .map((candidates, cell) => ({ cell, candidates }))
    .sort((x, y) => x.candidates.length - y.candidates.length)
  for (let retry = 0; retry < ASSIGNMENT_RETRIES; retry++) {
    const used = new Set<number>()
    let ok = true
    for (const { candidates } of order) {
      const open = candidates.filter((i) => !used.has(i))
      if (open.length === 0) {
        ok = false
        break
      }
      used.add(open[Math.floor(rng() * open.length)])
    }
    if (ok) return true
  }
  return false
}

export function generateBoard(dateStr: string): Board {
  const rng = mulberry32(hashDateSeed(`stock-room:${dateStr}`))

  for (let attempt = 0; attempt < BOARD_ATTEMPTS; attempt++) {
    const pool = shuffled(CRITERIA, rng)
    const rows = pool.slice(0, 3)
    const cols = pool.slice(3, 6)
    if (!varietyOk(rows, cols)) continue

    const cells: number[][] = []
    let solvable = true
    for (let r = 0; r < 3 && solvable; r++) {
      for (let c = 0; c < 3; c++) {
        const candidates = cellCandidates(rows[r], cols[c])
        if (candidates.length < MIN_CELL_ANSWERS) {
          solvable = false
          break
        }
        cells.push(candidates)
      }
    }
    if (!solvable || cells.length !== 9) continue
    if (!assignmentExists(cells, rng)) continue

    return {
      date: dateStr,
      rows,
      cols,
      cellCounts: cells.map((c) => c.length),
    }
  }

  throw new Error(`stock-room: could not generate a solvable board for ${dateStr}`)
}

/** Does this game satisfy both axes of the given cell? */
export function gameFitsCell(board: Board, cell: number, game: GameEntry): boolean {
  const row = board.rows[Math.floor(cell / 3)]
  const col = board.cols[cell % 3]
  return row.test(game) && col.test(game)
}

/**
 * Complete the board: a full no-reuse assignment of 9 game ids, keeping the
 * player's correct placements (`fixed`) where given. Open/incorrect cells are
 * filled famous-first (low popularityRank) so the end screen shows answers
 * people recognise. Deterministic backtracking — no rng.
 *
 * Returns null only if no completion extends `fixed` (caller should retry
 * with no fixed cells — generation guarantees the unconstrained solve).
 */
export function solveBoard(
  board: Board,
  fixed: ({ gameId: string } | null)[],
): string[] | null {
  const idToIndex = new Map(GAMES_DB.map((g, i) => [g.id, i]))
  const fixedIndices = fixed.map((f) => (f ? (idToIndex.get(f.gameId) ?? -1) : -1))
  const fixedSet = new Set(fixedIndices.filter((i) => i >= 0))

  const openCells: { cell: number; candidates: number[] }[] = []
  for (let cell = 0; cell < 9; cell++) {
    if (fixedIndices[cell] >= 0) continue
    const candidates = cellCandidates(board.rows[Math.floor(cell / 3)], board.cols[cell % 3])
      .filter((i) => !fixedSet.has(i))
      .sort(
        (a, b) =>
          (GAMES_DB[a].popularityRank ?? Number.MAX_SAFE_INTEGER) -
          (GAMES_DB[b].popularityRank ?? Number.MAX_SAFE_INTEGER),
      )
    openCells.push({ cell, candidates })
  }
  openCells.sort((a, b) => a.candidates.length - b.candidates.length)

  const result = [...fixedIndices]
  const used = new Set<number>(fixedSet)
  function fill(k: number): boolean {
    if (k === openCells.length) return true
    const { cell, candidates } = openCells[k]
    for (const i of candidates) {
      if (used.has(i)) continue
      used.add(i)
      result[cell] = i
      if (fill(k + 1)) return true
      used.delete(i)
      result[cell] = -1
    }
    return false
  }

  if (!fill(0)) return null
  return result.map((i) => GAMES_DB[i].id)
}
