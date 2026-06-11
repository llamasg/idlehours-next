// src/app/play/stock-room/lib/dateUtils.ts
// Stock Room — date helpers bound to this game's launch.

import { makeGameDates } from '@/lib/game-shell/gameDates'

const dates = makeGameDates('2026-06-11') // PROVISIONAL launch date

export const LAUNCH_DATE = dates.LAUNCH_DATE
export { getTodayDateString, formatDisplayDate, isToday } from '@/lib/dateUtils'
export const formatGameNumber = dates.formatGameNumber
export const isPlayableDate = dates.isPlayableDate
export const getArchiveDates = dates.getArchiveDates
