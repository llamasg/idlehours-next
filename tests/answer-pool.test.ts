// answerPool precedence — the contract for /staging/curation integration:
// hand verdict > override file > rank mapping; 'auto-no' is NOT a hand
// verdict and falls through.

import { describe, it, expect } from 'vitest'
import {
  resolveAnswerGrade,
  rankTier,
  tierMemberFloor,
  meetsTierFloor,
  RANK_TIER_1,
  RANK_TIER_2,
  RANK_TIER_3,
  type CurationEntry,
} from '@/lib/answerPool'

const none: Record<string, CurationEntry> = {}

describe('answerPool precedence', () => {
  it('hand verdict beats override file', () => {
    const curation = { g: { verdict: 'yes', tier: 1 } as CurationEntry }
    const overrides = { g: { verdict: 'no' } as CurationEntry }
    const grade = resolveAnswerGrade('g', 999, curation, overrides)
    expect(grade).toEqual({ answerGrade: true, tier: 1, source: 'hand' })
  })

  it('override file beats rank mapping', () => {
    const overrides = { g: { verdict: 'no' } as CurationEntry }
    // rank 5 would be tier 1 by rank mapping — the override wins
    const grade = resolveAnswerGrade('g', 5, none, overrides)
    expect(grade).toEqual({ answerGrade: false, tier: null, source: 'override' })
  })

  it('rank mapping is the fallback for unjudged entries', () => {
    expect(resolveAnswerGrade('g', RANK_TIER_1, none, none)).toEqual({
      answerGrade: true,
      tier: 1,
      source: 'rank',
    })
    expect(resolveAnswerGrade('g', RANK_TIER_2, none, none).tier).toBe(2)
    expect(resolveAnswerGrade('g', RANK_TIER_3, none, none).tier).toBe(3)
    expect(resolveAnswerGrade('g', RANK_TIER_3 + 1, none, none)).toEqual({
      answerGrade: false,
      tier: null,
      source: 'rank',
    })
    expect(resolveAnswerGrade('g', null, none, none).answerGrade).toBe(false)
  })

  it("'auto-no' is not a hand verdict — falls through to override, then rank", () => {
    const curation = { g: { verdict: 'auto-no' } as CurationEntry }
    const overrides = { g: { verdict: 'yes', tier: 2 } as CurationEntry }
    expect(resolveAnswerGrade('g', 999, curation, overrides)).toEqual({
      answerGrade: true,
      tier: 2,
      source: 'override',
    })
    // no override → rank mapping
    expect(resolveAnswerGrade('g', 10, curation, none)).toEqual({
      answerGrade: true,
      tier: 1,
      source: 'rank',
    })
  })

  it('a yes hand verdict without an explicit tier defaults to fringe (3)', () => {
    const curation = { g: { verdict: 'yes' } as CurationEntry }
    expect(resolveAnswerGrade('g', null, curation, none).tier).toBe(3)
  })

  it('Box Set member floors: yellow = tier 1, green = tier 1–2, blue/purple unrestricted', () => {
    expect(tierMemberFloor('yellow')).toEqual([1])
    expect(tierMemberFloor('green')).toEqual([1, 2])
    expect(tierMemberFloor('blue')).toBeNull()
    expect(tierMemberFloor('purple')).toBeNull()

    const t1 = resolveAnswerGrade('g', 5, none, none) // rank tier 1
    const t2 = resolveAnswerGrade('g', RANK_TIER_2, none, none) // tier 2
    const noGrade = resolveAnswerGrade('g', null, none, none)
    expect(meetsTierFloor(t1, 'yellow')).toBe(true)
    expect(meetsTierFloor(t2, 'yellow')).toBe(false)
    expect(meetsTierFloor(t2, 'green')).toBe(true)
    expect(meetsTierFloor(noGrade, 'purple')).toBe(true) // unrestricted
    // hand verdict drives the floor through precedence
    const handT1 = resolveAnswerGrade('g', 999, { g: { verdict: 'yes', tier: 1 } }, none)
    expect(meetsTierFloor(handT1, 'yellow')).toBe(true)
  })

  it('rankTier boundaries', () => {
    expect(rankTier(1)).toBe(1)
    expect(rankTier(RANK_TIER_1 + 1)).toBe(2)
    expect(rankTier(RANK_TIER_2 + 1)).toBe(3)
    expect(rankTier(null)).toBeNull()
  })
})
