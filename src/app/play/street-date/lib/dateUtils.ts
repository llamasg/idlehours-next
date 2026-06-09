// src/app/play/street-date/lib/dateUtils.ts
// Street Date — date math, epoch, display helpers

import { makeGameDates } from '@/lib/game-shell/gameDates'

// TODO: STABILITY — daily game selection is derived from GAMES.length and array
// shuffling. Adding games changes past date assignments. This is acceptable pre-launch
// but must be fixed before significant archive growth.
//
// Fix: build a pre-computed daily-schedule.ts that maps dates to game IDs explicitly.
// Trigger: implement this before launch or before database exceeds 2,000 games,
// whichever comes first. See docs/plans/daily-schedule-stability.md

// ── Dates bound to this game's launch ───────────────────────────────────────

const dates = makeGameDates('2026-02-22')

export const LAUNCH_DATE = dates.LAUNCH_DATE
export { getTodayDateString, formatDisplayDate, isToday } from '@/lib/dateUtils'
export const formatGameNumber = dates.formatGameNumber
export const isPlayableDate = dates.isPlayableDate
export const getArchiveDates = dates.getArchiveDates
