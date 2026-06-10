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
 * NOTE: tuned against the METADATA distance distribution (RANKINGS is null —
 * the semantic precompute never shipped). If a semantic scorer lands, these
 * need retuning against its distribution.
 */
export const GAME_SENSE_REVEAL_THRESHOLDS = [1500, 600, 250, 100, 40, 12] as const

// ── Game Sense v2 — spine hints + give-up (TUNING CONSTANTS) ─────────────────

/** Letter pattern spine hint (word count + blanks). */
export const GAME_SENSE_LETTER_PATTERN_COST = 100

/** First-letter spine hint. */
export const GAME_SENSE_FIRST_LETTER_COST = 200

/** Standalone give-up unlocks after this many real (non-hint) guesses. */
export const GAME_SENSE_GIVE_UP_MIN_GUESSES = 5
