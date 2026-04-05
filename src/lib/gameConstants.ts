// Shared constants used across all three daily games

/** Spring easing curve — used for button presses, card lifts, entrance animations */
export const SPRING_EASING = 'cubic-bezier(0.34,1.5,0.64,1)'

/** Entrance animation step timings (ms) — shared across game pages */
export const ENTRANCE_TIMINGS = [350, 1700, 2400, 3100, 3400, 3900] as const

/** Post-game entrance step gaps (ms) — drives ResultCard/badge cascade */
export const POSTGAME_GAPS = [0, 3500, 400, 300, 300, 400, 500] as const
