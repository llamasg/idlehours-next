// answerPool core — plain JS (.mjs) ON PURPOSE, like predicates.mjs: this
// single implementation is imported by the Next.js runtime (src/lib/
// answerPool.ts, via allowJs) AND by Node seeders (scripts/
// seed-franchise-concepts.mjs). Keep it dependency-free and pure.
//
// Precedence: hand verdict (curation.json; 'auto-no' does NOT count and
// falls through) > override file > rank-derived mapping.

// Rank-derived fallback tiers (TUNING — audit-band equivalents; recalibrate
// from recognition audit v2 know-rates when results land).
export const RANK_TIER_1 = 30
export const RANK_TIER_2 = 90
export const RANK_TIER_3 = 150

export function rankTier(popularityRank) {
  if (popularityRank == null) return null
  if (popularityRank <= RANK_TIER_1) return 1
  if (popularityRank <= RANK_TIER_2) return 2
  if (popularityRank <= RANK_TIER_3) return 3
  return null
}

function fromEntry(entry, source) {
  const yes = entry.verdict === 'yes'
  return { answerGrade: yes, tier: yes ? (entry.tier ?? 3) : null, source }
}

/** Pure resolver — sources injected so tests/scripts can supply their own. */
export function resolveAnswerGrade(gameId, popularityRank, curation, overrides) {
  const hand = curation[gameId]
  if (hand && hand.verdict !== 'auto-no') return fromEntry(hand, 'hand')

  const override = overrides[gameId]
  if (override && override.verdict !== 'auto-no') return fromEntry(override, 'override')

  const tier = rankTier(popularityRank)
  return { answerGrade: tier !== null, tier, source: 'rank' }
}

/**
 * Box Set member floors per puzzle tier (curation pass-2 tiers):
 *   yellow → members must be tier 1 (easy win)
 *   green  → tier 1–2
 *   blue/purple → unrestricted (title-legible rule stands)
 * Returns the allowed answer tiers, or null for unrestricted.
 */
export function tierMemberFloor(puzzleTier) {
  if (puzzleTier === 'yellow') return [1]
  if (puzzleTier === 'green') return [1, 2]
  return null
}

/** True if the game's resolved grade satisfies the floor for a puzzle tier. */
export function meetsTierFloor(grade, puzzleTier) {
  const floor = tierMemberFloor(puzzleTier)
  if (floor === null) return true
  return grade.answerGrade && floor.includes(grade.tier)
}
