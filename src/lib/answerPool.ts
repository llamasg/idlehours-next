// Answer-grade pool — which GAMES_DB games are fair answers for guessing
// games, and how easy. Single source for "is this game answer-grade".
//
// Three layers, strict precedence (proven by tests/answer-pool.test.ts):
//   1. HAND VERDICT — src/data/curation/curation.json, exported from the
//      /staging/curation triage tool. 'auto-no' entries (cliff auto-default,
//      not hand-judged) do NOT count as hand verdicts and fall through.
//   2. OVERRIDE FILE — src/data/curation/overrides.json, ad-hoc corrections.
//   3. RANK MAPPING — popularityRank-derived fallback for everything else
//      (audit-band equivalents; recalibrate from recognition audit v2).
//
// Tiers: 1 easy win · 2 solid · 3 fringe · null = not answer-grade.
// The pure logic lives in answerPool.core.mjs (shared with Node seeders —
// the predicates.mjs pattern); this module binds it to the committed data.

import type { GameEntry } from '@/data/games-db'
import curationJson from '@/data/curation/curation.json'
import overridesJson from '@/data/curation/overrides.json'
import {
  resolveAnswerGrade as resolveCore,
  rankTier,
  tierMemberFloor,
  meetsTierFloor,
  RANK_TIER_1,
  RANK_TIER_2,
  RANK_TIER_3,
} from './answerPool.core.mjs'

export type AnswerTier = 1 | 2 | 3

export interface CurationEntry {
  verdict: 'yes' | 'no' | 'auto-no'
  tier?: AnswerTier
  /** Cluster the verdict was applied through (franchise/title-prefix key). */
  clustered?: string
}

export interface AnswerGrade {
  answerGrade: boolean
  tier: AnswerTier | null
  source: 'hand' | 'override' | 'rank'
}

export { rankTier, tierMemberFloor, meetsTierFloor, RANK_TIER_1, RANK_TIER_2, RANK_TIER_3 }

/** Pure resolver — injectable sources so tests can prove precedence. */
export function resolveAnswerGrade(
  gameId: string,
  popularityRank: number | null,
  curation: Record<string, CurationEntry>,
  overrides: Record<string, CurationEntry>,
): AnswerGrade {
  return resolveCore(gameId, popularityRank, curation, overrides) as AnswerGrade
}

const CURATION = curationJson as Record<string, CurationEntry>
const OVERRIDES = overridesJson as Record<string, CurationEntry>

/** The committed-data binding games should use. */
export function getAnswerGrade(game: Pick<GameEntry, 'id' | 'popularityRank'>): AnswerGrade {
  return resolveAnswerGrade(game.id, game.popularityRank, CURATION, OVERRIDES)
}

export function isAnswerGrade(game: Pick<GameEntry, 'id' | 'popularityRank'>): boolean {
  return getAnswerGrade(game).answerGrade
}
