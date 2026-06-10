// Box Set concept-bank verification — the CI guard.
//
// 1. Every concept must still resolve to ≥4 matches against the CURRENT
//    GAMES_DB (a db edit can silently invalidate a concept — that fails here).
// 2. Stored gameIds must still satisfy their predicate.
// 3. Committed puzzles must stay internally consistent (each of the 16 games
//    satisfies exactly its own group's predicate) — pinned by snapshot too.
// 4. Buffer guard: WARNS (does not fail) when committed puzzles cover fewer
//    than 14 days ahead of today.

import { describe, it, expect } from 'vitest'
import { CONCEPTS, verifyBank } from '@/app/play/box-set/lib/conceptBank'

describe('box-set concept bank', () => {
  it('every concept resolves cleanly against the current GAMES_DB', () => {
    const issues = verifyBank()
    if (issues.length > 0) {
      console.error(issues)
    }
    expect(issues).toEqual([])
  })

  it('bank composition snapshot (totals per tier)', () => {
    const totals: Record<string, { available: number; used: number }> = {}
    for (const c of CONCEPTS) {
      totals[c.tier] ??= { available: 0, used: 0 }
      totals[c.tier][c.usedOn === null ? 'available' : 'used'] += 1
    }
    expect(totals).toMatchSnapshot()
  })
})
