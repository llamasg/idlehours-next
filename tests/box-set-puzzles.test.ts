// Committed Box Set puzzles — the data contract.
//
// 1. CONSISTENCY: re-verifies, against the CURRENT GAMES_DB, that every game
//    in every committed puzzle satisfies exactly its own group's predicate.
//    A games-db edit that breaks a shipped puzzle fails here.
// 2. SNAPSHOT: pins the committed data — accidental regeneration shows up as
//    a snapshot diff (regenerating on purpose = update the snapshot in the
//    same commit as the new puzzles).
// 3. BUFFER GUARD: warns (does not fail) when committed puzzles cover fewer
//    than 14 days ahead of today (Europe/London).

import { describe, it, expect } from 'vitest'
import { GAMES_DB } from '@/data/games-db'
import { PUZZLES, latestPuzzleDate } from '@/app/play/box-set/lib/puzzles'
import { CONCEPTS } from '@/app/play/box-set/lib/conceptBank'
import '@/app/play/box-set/lib/wordplayMatchers.mjs'
import { evaluatePredicate } from '@/app/play/box-set/lib/predicates.mjs'
import { getTodayDateString } from '@/lib/dateUtils'

const byId = new Map(GAMES_DB.map((g) => [g.id, g]))
const conceptById = new Map(CONCEPTS.map((c) => [c.id, c]))

describe('box-set committed puzzles', () => {
  it('every puzzle is unambiguous against the current GAMES_DB', () => {
    const problems: string[] = []
    for (const [date, puzzle] of Object.entries(PUZZLES)) {
      const tileIds = puzzle.tiles.map((t) => t.id)
      const groupIds = puzzle.groups.flatMap((g) => g.gameIds)
      if (tileIds.length !== 16 || new Set(tileIds).size !== 16) {
        problems.push(`${date}: tiles are not 16 unique games`)
      }
      if ([...tileIds].sort().join() !== [...groupIds].sort().join()) {
        problems.push(`${date}: tiles do not match group members`)
      }
      for (const group of puzzle.groups) {
        const concept = conceptById.get(group.conceptId)
        if (!concept) {
          problems.push(`${date}: unknown concept ${group.conceptId}`)
          continue
        }
        if (concept.usedOn !== date) {
          problems.push(`${date}: concept ${group.conceptId} usedOn=${concept.usedOn}`)
        }
      }
      for (const gid of groupIds) {
        const game = byId.get(gid)
        if (!game) {
          problems.push(`${date}: game ${gid} no longer in GAMES_DB`)
          continue
        }
        for (const group of puzzle.groups) {
          const concept = conceptById.get(group.conceptId)
          if (!concept) continue
          const satisfies = evaluatePredicate(concept.predicate, game)
          const belongs = group.gameIds.includes(gid)
          if (belongs && !satisfies) problems.push(`${date}: ${gid} no longer satisfies own group ${group.conceptId}`)
          if (!belongs && satisfies) problems.push(`${date}: ${gid} ALSO satisfies ${group.conceptId} (ambiguous)`)
        }
      }
    }
    if (problems.length) console.error(problems.slice(0, 20))
    expect(problems).toEqual([])
  })

  it('committed puzzle data snapshot', () => {
    expect(PUZZLES).toMatchSnapshot()
  })

  it('buffer guard: >=14 days of puzzles ahead (warn only)', () => {
    const latest = latestPuzzleDate()
    expect(latest).not.toBeNull()
    const today = getTodayDateString()
    const daysAhead = Math.floor(
      (new Date(`${latest}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000,
    )
    if (daysAhead < 14) {
      console.warn(
        `⚠ box-set puzzle buffer low: ${daysAhead} days ahead (latest ${latest}). ` +
        'Run: node scripts/assemble-box-set.mjs',
      )
    }
    expect(daysAhead).toBeGreaterThanOrEqual(0)
  })
})
