// Single read path for "did the player finish today's puzzle?" across the
// three daily games — a thin view over the manifest registry, kept for the
// badge shelf / today card's narrower needs.

import { getTodayDateString } from '@/lib/dateUtils'
import type { DailyGameSlug } from '@/lib/ranks'
import { MANIFESTS } from './registry'

export interface DailyCompletion {
  completed: boolean
  won: boolean
  score: number
  rankName: string
}

const NOT_PLAYED: DailyCompletion = { completed: false, won: false, score: 0, rankName: '' }

/**
 * Completion state for one daily game on one date (defaults to today,
 * Europe/London). Returns NOT_PLAYED on the server and on any parse error.
 * Win-condition asymmetry lives in each game's manifest toDayResult.
 */
export function getDailyCompletion(
  slug: DailyGameSlug,
  dateStr: string = getTodayDateString(),
): DailyCompletion {
  if (typeof window === 'undefined') return NOT_PLAYED
  const manifest = MANIFESTS[slug]
  const result = manifest.toDayResult(manifest.loadDayState(dateStr))
  if (!result.completed) return NOT_PLAYED
  return { completed: true, won: result.won, score: result.score, rankName: result.rank }
}
