// Stock Room board preview — human review tool, not part of the app.
//
//   npx tsx scripts/preview-stock-room.ts [days] [start-date]
//
// Prints the next N daily boards (default 14, from today Europe/London)
// with per-cell answer counts and recognisable counts (popularityRank ≤
// RECOGNISABLE_RANK). Cells with recognisable-count < THIN_INTERSECTION are
// flagged THIN INTERSECTION — review them and feed confirmed stinkers into
// AXIS_PAIR_BLOCKLIST in lib/boardGen.ts.

import {
  generateBoard,
  boardCellCandidates,
  recognisableCount,
  RECOGNISABLE_RANK,
  THIN_INTERSECTION,
} from '../src/app/play/stock-room/lib/boardGen'
import { GAMES_DB } from '../src/data/games-db'

const days = Number(process.argv[2] ?? 14)
const start = process.argv[3] ?? new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London',
}).format(new Date())

let thinTotal = 0

for (let i = 0; i < days; i++) {
  const d = new Date(`${start}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + i)
  const date = d.toISOString().slice(0, 10)

  const board = generateBoard(date)
  console.log(`\n=== ${date}`)
  console.log(`  rows: ${board.rows.map((r) => r.label).join(' | ')}`)
  console.log(`  cols: ${board.cols.map((c) => c.label).join(' | ')}`)

  for (let cell = 0; cell < 9; cell++) {
    const candidates = boardCellCandidates(board, cell)
    const recog = recognisableCount(candidates)
    const row = board.rows[Math.floor(cell / 3)]
    const col = board.cols[cell % 3]
    const thin = recog < THIN_INTERSECTION
    if (thin) thinTotal++

    const examples = candidates
      .map((idx) => GAMES_DB[idx])
      .filter((g) => g.popularityRank != null && g.popularityRank <= RECOGNISABLE_RANK)
      .sort((a, b) => (a.popularityRank ?? 0) - (b.popularityRank ?? 0))
      .slice(0, 3)
      .map((g) => g.title)
      .join(', ')

    console.log(
      `  [${cell}] ${row.label} × ${col.label}: ${candidates.length} answers, ` +
        `${recog} recognisable${thin ? '  ⚠ THIN INTERSECTION' : ''}` +
        (thin ? `\n        top picks: ${examples || '(none)'}` : ''),
    )
  }
}

console.log(
  `\n${thinTotal === 0 ? 'No thin intersections.' : `${thinTotal} THIN INTERSECTION cell(s) — review for the blocklist (lib/boardGen.ts AXIS_PAIR_BLOCKLIST).`}`,
)
