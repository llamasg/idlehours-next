import { GAMES } from '../data/games';

// TODO: STABILITY — daily game selection is derived from GAMES.length and array
// shuffling. Adding games changes past date assignments. This is acceptable pre-launch
// but must be fixed before significant archive growth.
//
// Fix: build a pre-computed daily-schedule.ts that maps dates to game IDs explicitly.
// Trigger: implement this before launch or before database exceeds 2,000 games,
// whichever comes first. See docs/plans/daily-schedule-stability.md

// ── Constants ────────────────────────────────────────────────────────────────

/** The date Game Sense launched, as a YYYY-MM-DD string. */
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
 * Simple seeded PRNG (mulberry32) for deterministic shuffling.
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Compute a popularity weight for a game. Higher = more likely to appear
 * earlier in the daily rotation. Factors in:
 * - Year (newer games weighted higher)
 * - OpenCritic score (higher rated = higher weight)
 * - Having complete data is a baseline signal of relevance
 */
function gameWeight(game: typeof GAMES[number]): number {
  // Year factor: 1.0 for pre-2000, scaling up to 3.0 for 2020+
  const yearFactor = game.year >= 2020 ? 3.0
    : game.year >= 2015 ? 2.5
    : game.year >= 2010 ? 2.0
    : game.year >= 2005 ? 1.5
    : game.year >= 2000 ? 1.2
    : 1.0;

  // OpenCritic factor: 1.0 for no score, up to 2.0 for highly rated
  const ocFactor = game.openCritic !== null
    ? 1.0 + (Math.min(game.openCritic, 95) / 95)
    : 1.0;

  return yearFactor * ocFactor;
}

/**
 * Deterministic weighted shuffle for the GAMES array.
 * Games with higher popularity weights appear earlier in the rotation,
 * so daily games skew toward well-known, modern titles while still
 * including the full catalog over time.
 *
 * Uses a fixed seed so the mapping is stable across all sessions.
 */
const _shuffledIndices: number[] = (() => {
  const rng = mulberry32(314159); // fixed seed

  // Build weighted index pairs
  const weighted = GAMES.map((game, i) => ({
    index: i,
    // Sort key: weight * random — higher weight games get higher keys on average
    // This is a weighted sampling without replacement (Efraimidis-Spirakis algorithm)
    key: Math.pow(rng(), 1 / gameWeight(game)),
  }));

  // Sort descending by key — high-weight games cluster toward the front
  weighted.sort((a, b) => b.key - a.key);

  return weighted.map(w => w.index);
})();

/**
 * Deterministic index into the GAMES array for a given date.
 * Uses a pre-shuffled index mapping so daily games are a mix of
 * eras rather than walking chronologically through the database.
 */
export function getGameIndexForDate(dateStr: string): number {
  const days = getDaysSinceEpoch(dateStr);
  const slot = ((days % GAMES.length) + GAMES.length) % GAMES.length;
  return _shuffledIndices[slot];
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
