// Per-game date helpers bound to a launch date — replaces the three
// hand-written wrapper modules that each re-exported @/lib/dateUtils
// with their own LAUNCH_DATE baked in.

import {
  getDaysSinceEpoch,
  formatGameNumber,
  isPlayableDate,
  getArchiveDates,
} from '@/lib/dateUtils'

export interface GameDates {
  LAUNCH_DATE: string
  /** Midnight UTC on launch day — the epoch from which day offsets are counted. */
  EPOCH: Date
  getDaysSinceEpoch(dateStr: string): number
  formatGameNumber(dateStr: string): string
  isPlayableDate(dateStr: string): boolean
  getArchiveDates(): string[]
}

export function makeGameDates(launchDate: string): GameDates {
  const epoch = new Date(`${launchDate}T00:00:00+00:00`)
  return {
    LAUNCH_DATE: launchDate,
    EPOCH: epoch,
    getDaysSinceEpoch: (dateStr) => getDaysSinceEpoch(epoch, dateStr),
    formatGameNumber: (dateStr) => formatGameNumber(launchDate, dateStr),
    isPlayableDate: (dateStr) => isPlayableDate(launchDate, dateStr),
    getArchiveDates: () => getArchiveDates(launchDate),
  }
}
