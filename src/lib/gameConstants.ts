// Shared constants used across all three daily games

/** Spring easing curve — used for button presses, card lifts, entrance animations */
export const SPRING_EASING = 'cubic-bezier(0.34,1.5,0.64,1)'

/** Entrance animation step timings (ms) — shared across game pages */
export const ENTRANCE_TIMINGS = [350, 1700, 2400, 3100, 3400, 3900] as const

/** Post-game entrance step gaps (ms) — drives ResultCard/badge cascade */
export const POSTGAME_GAPS = [0, 3500, 400, 300, 300, 400, 500] as const

// ── Game Sense v2 — box reveal (TUNING CONSTANTS, playtest will move these) ──

/** Number of organic reveal patches on the mystery box. */
export const GAME_SENSE_MAX_PATCHES = 6

/**
 * Best-proximity thresholds that unlock patches: best ≤ value unlocks patch N.
 * Step function of BEST guess so far — never cumulative across guesses.
 *
 * CALIBRATED 2026-06 from 1,050 popularity-weighted guess pairs (guess draw
 * ∝ 1/popularityRank) against answers sampled from the final weekday bands
 * at weekday frequency. Percentile targets → empirical rates:
 *   patch 1 top 10%   → ≤500 (10.3%)     patch 4 top 0.6%  → ≤60 (0.76%)
 *   patch 2 top 4%    → ≤200 (4.0%)      patch 5 top 0.25% → ≤25 (0.29%)
 *   patch 3 top 1.5%  → ≤85  (1.5%)      patch 6 top 4 ranks → ≤5
 * The raw 0.25th percentile collapsed onto rank 5 (sparse tail); 25 is the
 * monotone bridge so patch 5 ≠ patch 6.
 *
 * NOTE: tuned against the METADATA distance distribution (RANKINGS is null —
 * the semantic precompute never shipped). If a semantic scorer lands, these
 * need retuning against its distribution.
 */
export const GAME_SENSE_REVEAL_THRESHOLDS = [500, 200, 85, 60, 25, 5] as const

// ── Game Sense v2 — spine hints + give-up (TUNING CONSTANTS) ─────────────────

/** Letter pattern spine hint (word count + blanks). */
export const GAME_SENSE_LETTER_PATTERN_COST = 100

/** First-letter spine hint. */
export const GAME_SENSE_FIRST_LETTER_COST = 200

/** Standalone give-up unlocks after this many real (non-hint) guesses. */
export const GAME_SENSE_GIVE_UP_MIN_GUESSES = 5

/** Guess decay: every real guess FROM the 2nd costs this (1-guess win = 1000
 *  = One Shot; a 60-guess convergence win lands mid-rank, not One Shot). */
export const GAME_SENSE_GUESS_DECAY = 15

/** Score never decays/spends below this — Bust stays give-up-only. Paid
 *  reveals cannot be bought with points inside the floor. */
export const GAME_SENSE_SCORE_FLOOR = 50
