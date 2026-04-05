import { GAMES } from '../data/games';

import {
  getTodayDateString,
  formatDisplayDate,
  isToday,
  getDaysSinceEpoch as _getDaysSinceEpoch,
  formatGameNumber as _formatGameNumber,
  isPlayableDate as _isPlayableDate,
  getArchiveDates as _getArchiveDates,
} from '@/lib/dateUtils';

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

// ── Re-export shared utils bound to this game's dates ──────────────────────

export { getTodayDateString, formatDisplayDate, isToday };
export const getDaysSinceEpoch = (dateStr: string) => _getDaysSinceEpoch(EPOCH, dateStr);
export const formatGameNumber = (dateStr: string) => _formatGameNumber(LAUNCH_DATE, dateStr);
export const isPlayableDate = (dateStr: string) => _isPlayableDate(LAUNCH_DATE, dateStr);
export const getArchiveDates = () => _getArchiveDates(LAUNCH_DATE);

// ── Game-specific functions ────────────────────────────────────────────────

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
 */
const _shuffledIndices: number[] = (() => {
  const rng = mulberry32(314159); // fixed seed

  const weighted = GAMES.map((game, i) => ({
    index: i,
    key: Math.pow(rng(), 1 / gameWeight(game)),
  }));

  weighted.sort((a, b) => b.key - a.key);

  return weighted.map(w => w.index);
})();

/**
 * Deterministic index into the GAMES array for a given date.
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
