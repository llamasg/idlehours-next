// src/app/play/street-date/lib/dateUtils.ts
// Street Date — date math, epoch, year selection, display helpers

import { VALID_YEARS } from '../data/years'
import { getGamesForYear } from './roundUtils'
import type { StreetDateGame } from '../data/games'

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

// ── Game-specific functions ────────────────────────────────────────────────

/**
 * Deterministic index into the VALID_YEARS array for a given date.
 */
export function getYearIndexForDate(dateStr: string): number {
  const days = getDaysSinceEpoch(dateStr)
  return ((days % VALID_YEARS.length) + VALID_YEARS.length) % VALID_YEARS.length
}

/**
 * The answer year for this date's Street Date puzzle.
 */
export function getYearForDate(dateStr: string): number {
  return VALID_YEARS[getYearIndexForDate(dateStr)]
}

/**
 * The 5 StreetDateGame entries for this date's puzzle.
 */
export function getGamesForDate(dateStr: string): StreetDateGame[] {
  const days = getDaysSinceEpoch(dateStr)
  const cycle = Math.floor(days / VALID_YEARS.length)
  return getGamesForYear(getYearForDate(dateStr), cycle)
}

/**
 * Sequential, 1-indexed game number.
 */
export function getGameNumber(dateStr: string): number {
  return getDaysSinceEpoch(dateStr) + 1
}
