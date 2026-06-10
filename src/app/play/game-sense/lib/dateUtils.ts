import { GAMES } from '../data/games';

import { makeGameDates } from '@/lib/game-shell/gameDates';
import { mulberry32, hashDateSeed } from '@/lib/game-shell/seededRng';

// TODO: STABILITY — applies to the V1 (pre-cutover) selection only: it derives
// assignments from GAMES.length and array shuffling, so adding games changes
// past date assignments. Acceptable pre-launch; pinned by snapshots.
// The V2 (banded) selection below is rendezvous-hashed by game ID, so db
// growth only reassigns the dates a newly added game would have won.
// See docs/plans/daily-schedule-stability.md

// ── Dates bound to this game's launch ───────────────────────────────────────

const dates = makeGameDates('2026-02-22');

export const LAUNCH_DATE = dates.LAUNCH_DATE;
export { getTodayDateString, formatDisplayDate, isToday } from '@/lib/dateUtils';
const getDaysSinceEpoch = dates.getDaysSinceEpoch;
export const formatGameNumber = dates.formatGameNumber;
export const isPlayableDate = dates.isPlayableDate;
export const getArchiveDates = dates.getArchiveDates;

// ── Game-specific functions ────────────────────────────────────────────────

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
 * V1 selection (pre-cutover) — UNTOUCHED. Historical puzzles are pinned by
 * tests/puzzle-snapshots.test.ts; never edit this path.
 */
function getGameIndexForDateV1(dateStr: string): number {
  const days = getDaysSinceEpoch(dateStr);
  const slot = ((days % GAMES.length) + GAMES.length) % GAMES.length;
  return _shuffledIndices[slot];
}

// ── Selection V2: weekday popularity banding (versioned cutover) ────────────
// The selection algorithm is versioned by a FIXED literal date so historical
// puzzles never change. A future scorer/selection change should ride this
// same pattern: new version, new cutover constant, old paths untouched.

/** Dates on/after this use banded selection; before it, V1. FROZEN once live. */
export const SELECTION_V2_CUTOVER = '2026-06-15';

/** Selecting for date D excludes the previous N days' picks (stateless,
 *  deterministic lookback — see getGameIndexForDateV2). */
export const EXCLUSION_WINDOW_DAYS = 30;

/**
 * Weekday difficulty bands over popularityRank VALUES (1 = most popular,
 * ~213 = deepest; band membership is rank-range based so db growth cannot
 * reshuffle assignments). Mon/Tue easiest → Saturday deepest; Sunday sits
 * with Wednesday (weekends are peak new-player discovery — Saturday keeps
 * the deep-cut culture, Sunday is fair ground).
 * getUTCDay(): 0 = Sunday … 6 = Saturday.
 *
 * PROVISIONAL EDGES: pending /staging/recognition-audit calibration.
 * Edge changes are free until public launch; after launch they require a
 * new versioned cutover (V3), never an in-place edit.
 */
export const WEEKDAY_BANDS = [
  { name: 'mon-tue',  days: [1, 2], minRank: 1,   maxRank: 20 },
  { name: 'wed-sun',  days: [3, 0], minRank: 21,  maxRank: 50 },
  { name: 'thu',      days: [4],    minRank: 51,  maxRank: 90 },
  { name: 'fri',      days: [5],    minRank: 91,  maxRank: 140 },
  { name: 'saturday', days: [6],    minRank: 141, maxRank: Number.MAX_SAFE_INTEGER },
] as const;

export function bandForDate(dateStr: string) {
  const weekday = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return WEEKDAY_BANDS.find((b) => (b.days as readonly number[]).includes(weekday))!;
}

// ── V2 internals ─────────────────────────────────────────────────────────────

const CUTOVER_MS = Date.parse(`${SELECTION_V2_CUTOVER}T00:00:00Z`);
const MS_PER_DAY = 86_400_000;

function v2DateForOffset(offset: number): string {
  return new Date(CUTOVER_MS + offset * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Rendezvous pick within a band, skipping excluded ids. */
function rendezvousPick(dateStr: string, excluded: Set<string>): number {
  const band = bandForDate(dateStr);
  let bestIndex = -1;
  let bestScore = -1;
  for (let i = 0; i < GAMES.length; i++) {
    const rank = GAMES[i].popularityRank;
    if (rank === null || rank < band.minRank || rank > band.maxRank) continue;
    if (excluded.has(GAMES[i].id)) continue;
    const score = mulberry32(hashDateSeed(`${dateStr}:${GAMES[i].id}`))();
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestIndex;
}

// Sequential pick cache: index k = the pick for cutover+k days. The exclusion
// window makes picks inductive (day D depends on days D-1..D-30), so V2 picks
// are a deterministic fold from the cutover, lazily extended and cached for
// the session. Smallest band (~392) vs window (30) means exhaustion is
// impossible. Stability note: a db addition that wins an early date can
// ripple through later exclusion sets — weaker than pure rendezvous but still
// far more stable than V1, and snapshots pin the outputs.
const v2Picks: number[] = [];

/**
 * V2 selection: weekday-banded rendezvous (highest-random-weight) hashing
 * with a stateless EXCLUSION_WINDOW_DAYS lookback — the previous 30 days'
 * picks are recomputed deterministically and excluded, then the
 * highest-scoring survivor wins.
 */
function getGameIndexForDateV2(dateStr: string): number {
  const offset = Math.round((Date.parse(`${dateStr}T00:00:00Z`) - CUTOVER_MS) / MS_PER_DAY);
  while (v2Picks.length <= offset) {
    const day = v2Picks.length;
    const excluded = new Set<string>();
    for (let back = Math.max(0, day - EXCLUSION_WINDOW_DAYS); back < day; back++) {
      excluded.add(GAMES[v2Picks[back]].id);
    }
    v2Picks.push(rendezvousPick(v2DateForOffset(day), excluded));
  }
  return v2Picks[offset];
}

/**
 * Deterministic index into the GAMES array for a given date.
 */
export function getGameIndexForDate(dateStr: string): number {
  return dateStr >= SELECTION_V2_CUTOVER
    ? getGameIndexForDateV2(dateStr)
    : getGameIndexForDateV1(dateStr);
}
