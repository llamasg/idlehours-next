import { GAMES } from '../data/games';

// ── Constants ────────────────────────────────────────────────────────────────

/** The date Skill Issue launched, as a YYYY-MM-DD string. */
export const LAUNCH_DATE = '2026-02-22';

/** Midnight UTC on launch day — the epoch from which day offsets are counted. */
export const EPOCH = new Date('2026-02-22T00:00:00+00:00');

/** IANA timezone used for the daily reset boundary. */
const TZ = 'Europe/London';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000;

/**
 * Parse a YYYY-MM-DD string into a Date at midnight UTC.
 * Avoids the pitfalls of `new Date(dateStr)` which can be
 * interpreted as local time in some engines.
 */
function parseUTCDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Return the ordinal suffix for a day-of-month number.
 */
function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns today's date as a YYYY-MM-DD string in the Europe/London timezone.
 * Games reset at midnight London time.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((p) => p.type === 'year')!.value;
  const month = parts.find((p) => p.type === 'month')!.value;
  const day = parts.find((p) => p.type === 'day')!.value;

  return `${year}-${month}-${day}`;
}

/**
 * Number of whole days between the EPOCH and the given date string.
 * Returns 0 on launch day, 1 the day after, etc.
 */
export function getDaysSinceEpoch(dateStr: string): number {
  const target = parseUTCDate(dateStr);
  return Math.floor((target.getTime() - EPOCH.getTime()) / MS_PER_DAY);
}

/**
 * Deterministic index into the GAMES array for a given date.
 * Uses modulo arithmetic and handles negative remainders safely
 * (e.g. if someone queries a date before the epoch).
 */
export function getGameIndexForDate(dateStr: string): number {
  const days = getDaysSinceEpoch(dateStr);
  return ((days % GAMES.length) + GAMES.length) % GAMES.length;
}

/**
 * Sequential, 1-indexed game number.
 * Game #1 is played on launch day (2026-02-22).
 */
export function getGameNumber(dateStr: string): number {
  return getDaysSinceEpoch(dateStr) + 1;
}

/**
 * Zero-padded game number string, e.g. "#001".
 */
export function formatGameNumber(dateStr: string): string {
  return `#${String(getGameNumber(dateStr)).padStart(3, '0')}`;
}

/**
 * Human-friendly display date, e.g. "Sun 22nd Feb 2026".
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseUTCDate(dateStr);

  const weekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date);

  const month = new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date);

  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${weekday} ${day}${ordinal(day)} ${month} ${year}`;
}

/**
 * True if the date falls within the playable window:
 * from launch day up to and including today (London time).
 */
export function isPlayableDate(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr >= LAUNCH_DATE && dateStr <= today;
}

/**
 * True if the given date string matches today's date in London time.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

/**
 * Returns every playable archive date (launch day through yesterday),
 * ordered newest-first.
 */
export function getArchiveDates(): string[] {
  const today = getTodayDateString();
  const dates: string[] = [];
  const current = new Date(EPOCH);

  while (true) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, '0');
    const d = String(current.getUTCDate()).padStart(2, '0');
    const ds = `${y}-${m}-${d}`;

    // Archive includes everything up to but NOT including today
    if (ds >= today) break;

    dates.push(ds);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates.reverse();
}
