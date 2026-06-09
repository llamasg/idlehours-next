// Characterization snapshots of the three daily games' puzzle generation.
//
// These are the contract for the game-shell refactor: puzzle output must be
// BIT-IDENTICAL per date across every phase (CLAUDE.md: puzzle generation is
// deterministic by date; changing it rewrites every historical puzzle).
// If a snapshot changes, the refactor broke determinism — revert the change,
// never update the snapshot.
//
// The only legitimate reason for these snapshots to change is a deliberate,
// owner-approved change to games-db.ts contents (puzzle selection derives
// from the filtered database — see docs/plans/daily-schedule-stability.md).

import { describe, it, expect } from 'vitest'

import { getGameIndexForDate } from '@/app/play/game-sense/lib/dateUtils'
import { GAMES as GAME_SENSE_GAMES } from '@/app/play/game-sense/data/games'
import { generatePuzzle } from '@/app/play/street-date/lib/puzzleGen'
import { getPairsForDate } from '@/app/play/shelf-price/lib/dateUtils'

// Launch dates: game-sense + street-date 2026-02-22, shelf-price 2026-03-03.
const SHARED_DATES = [
  '2026-03-03', // shelf-price launch
  '2026-03-15',
  '2026-04-01',
  '2026-05-15',
  '2026-06-09', // audit/refactor date
  '2026-07-04',
  '2026-08-30',
  '2026-10-31',
  '2026-12-25',
  '2027-01-01',
  '2027-02-22',
  '2027-06-09',
]

const GAME_SENSE_DATES = ['2026-02-22', '2026-03-01', ...SHARED_DATES]
const STREET_DATE_DATES = ['2026-02-22', '2026-03-01', ...SHARED_DATES]
const SHELF_PRICE_DATES = SHARED_DATES

describe('game-sense daily selection', () => {
  it('selects the same game id per date', () => {
    const result = Object.fromEntries(
      GAME_SENSE_DATES.map((date) => {
        const index = getGameIndexForDate(date)
        return [date, { index, id: GAME_SENSE_GAMES[index].id }]
      }),
    )
    expect(result).toMatchSnapshot()
  })
})

describe('street-date puzzle generation', () => {
  it('generates the same 7-game puzzle (order + shuffle) per date', () => {
    const result = Object.fromEntries(
      STREET_DATE_DATES.map((date) => {
        const puzzle = generatePuzzle(date)
        return [
          date,
          {
            games: puzzle.games.map((g) => ({ id: g.id, year: g.year })),
            shuffled: puzzle.shuffled.map((g) => g.id),
          },
        ]
      }),
    )
    expect(result).toMatchSnapshot()
  })
})

describe('shelf-price pair generation', () => {
  it('generates the same 11 pairs per date', () => {
    const result = Object.fromEntries(
      SHELF_PRICE_DATES.map((date) => {
        const pairs = getPairsForDate(date)
        return [
          date,
          pairs.map(([a, b]) => ({
            left: { id: a.id, price: a.launchPriceUsd },
            right: { id: b.id, price: b.launchPriceUsd },
          })),
        ]
      }),
    )
    expect(result).toMatchSnapshot()
  })
})
