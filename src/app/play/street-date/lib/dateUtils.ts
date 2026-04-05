// src/app/play/street-date/lib/dateUtils.ts
// Street Date — date math, epoch, display helpers

import {
  getTodayDateString,
  formatDisplayDate,
  isToday,
  getDaysSinceEpoch as _getDaysSinceEpoch,
  formatGameNumber as _formatGameNumber,
  isPlayableDate as _isPlayableDate,
  getArchiveDates as _getArchiveDates,
} from '@/lib/dateUtils'

// TODO: STABILITY — daily game selection is derived from GAMES.length and array
// shuffling. Adding games changes past date assignments. This is acceptable pre-launch
// but must be fixed before significant archive growth.
//
// Fix: build a pre-computed daily-schedule.ts that maps dates to game IDs explicitly.
// Trigger: implement this before launch or before database exceeds 2,000 games,
// whichever comes first. See docs/plans/daily-schedule-stability.md

// ── Constants ────────────────────────────────────────────────────────────────

/** The date Street Date launched, as a YYYY-MM-DD string. */
export const LAUNCH_DATE = '2026-02-22'

/** Midnight UTC on launch day — the epoch from which day offsets are counted. */
export const EPOCH = new Date('2026-02-22T00:00:00+00:00')

// ── Re-export shared utils bound to this game's dates ──────────────────────

export { getTodayDateString, formatDisplayDate, isToday }
export const getDaysSinceEpoch = (dateStr: string) => _getDaysSinceEpoch(EPOCH, dateStr)
export const formatGameNumber = (dateStr: string) => _formatGameNumber(LAUNCH_DATE, dateStr)
export const isPlayableDate = (dateStr: string) => _isPlayableDate(LAUNCH_DATE, dateStr)
export const getArchiveDates = () => _getArchiveDates(LAUNCH_DATE)

/**
 * Sequential, 1-indexed game number.
 */
export function getGameNumber(dateStr: string): number {
  return getDaysSinceEpoch(dateStr) + 1
}
