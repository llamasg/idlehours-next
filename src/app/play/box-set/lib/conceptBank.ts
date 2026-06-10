// Box Set concept bank — typed access to data/concepts.json plus
// verification used by tests and the assembly script.
//
// Concepts are pre-assembled, human-reviewable claims. Each one resolves to
// a set of game ids by pure predicate evaluation (see predicates.mjs) — no
// runtime generation, no external facts, no AI anywhere in the runtime path.
// A concept RETIRES when a puzzle uses it (usedOn set); assembly never
// reuses one.

import { GAMES_DB, type GameEntry } from '@/data/games-db'
// Side-effect import: registers the wordplay matchers before any evaluation.
import './wordplayMatchers.mjs'
import { evaluatePredicate, resolveConcept } from './predicates.mjs'
import conceptsJson from '../data/concepts.json'

export type ConceptTier = 'yellow' | 'green' | 'blue' | 'purple'
export type ConceptType = 'procedural' | 'tag' | 'wordplay' | 'curated'

export interface PredicateLeaf {
  field?: keyof GameEntry
  op: 'includes' | 'eq' | 'gte' | 'lte' | 'between' | 'only' | 'memberOf' | 'wordplay'
  value?: unknown
  matcher?: string
}
export type PredicateSpec = PredicateLeaf | { all: PredicateSpec[] }

export interface Concept {
  id: string
  /** Display label, e.g. "GAMES WHERE YOU FISH" */
  label: string
  tier: ConceptTier
  type: ConceptType
  predicate: PredicateSpec
  /** Resolved matches at seed time (re-verified by tests; ≥6 preferred). */
  gameIds: string[]
  /** Puzzle date that consumed this concept, null while available. */
  usedOn: string | null
  /** Provenance note for curated concepts (e.g. "TGA GOTY winners 2014–24"). */
  note?: string
}

export const CONCEPTS: Concept[] = conceptsJson.concepts as Concept[]

export function availableConcepts(tier?: ConceptTier): Concept[] {
  return CONCEPTS.filter((c) => c.usedOn === null && (!tier || c.tier === tier))
}

export function conceptMatches(concept: Concept, game: GameEntry): boolean {
  return evaluatePredicate(concept.predicate, game)
}

export interface ConceptIssue {
  conceptId: string
  problem: string
}

/**
 * Re-resolves every concept against the current GAMES_DB. A games-db edit can
 * silently invalidate a concept — this is the check that catches it (run in
 * tests/box-set-concepts.test.ts, i.e. on every `npm test` / CI run).
 */
export function verifyBank(): ConceptIssue[] {
  const issues: ConceptIssue[] = []
  const seenIds = new Set<string>()

  for (const concept of CONCEPTS) {
    if (seenIds.has(concept.id)) {
      issues.push({ conceptId: concept.id, problem: 'duplicate concept id' })
    }
    seenIds.add(concept.id)

    let resolved: string[]
    try {
      resolved = resolveConcept(concept, GAMES_DB)
    } catch (e) {
      issues.push({ conceptId: concept.id, problem: `predicate error: ${String(e)}` })
      continue
    }

    if (resolved.length < 4) {
      issues.push({
        conceptId: concept.id,
        problem: `only ${resolved.length} matches in GAMES_DB (need ≥4)`,
      })
    }

    const resolvedSet = new Set(resolved)
    const stale = concept.gameIds.filter((id) => !resolvedSet.has(id))
    if (stale.length > 0) {
      issues.push({
        conceptId: concept.id,
        problem: `stored gameIds no longer match predicate: ${stale.join(', ')}`,
      })
    }
  }

  return issues
}
