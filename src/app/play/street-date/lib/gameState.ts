export interface V2Guess {
  order: string[]
  correctCount: number
  results: ('exact' | 'close' | 'wrong')[]
  score: number
}

export interface V2DayState {
  gameIds: string[]
  shuffledIds: string[]
  slots: (string | null)[]
  pool: string[]
  guesses: V2Guess[]
  score: number
  won: boolean
  finished: boolean
  hintOneUsed: boolean
  hintAllUsed: boolean
  /** Key is "gameId:slotIndex", value is the result at time of reveal */
  revealedPairs: Record<string, 'exact' | 'close' | 'wrong'>
  revealedYearIds: string[]
  startedAt: number | null
  endedAt: number | null
}

const STORAGE_PREFIX = 'street_date_v3_'
const MAX_GUESSES = 5
const BASE_SCORE = 1000
const GUESS_PENALTY = 150
const HINT_ONE_COST = 100
const HINT_ALL_COST = 300

export { MAX_GUESSES, BASE_SCORE, GUESS_PENALTY, HINT_ONE_COST, HINT_ALL_COST }

export function createInitialState(gameIds: string[], shuffledIds: string[]): V2DayState {
  return {
    gameIds,
    shuffledIds,
    slots: Array(7).fill(null),
    pool: [...shuffledIds],
    guesses: [],
    score: BASE_SCORE,
    won: false,
    finished: false,
    hintOneUsed: false,
    hintAllUsed: false,
    revealedPairs: {},
    revealedYearIds: [],
    startedAt: null,
    endedAt: null,
  }
}

export function loadState(dateStr: string): V2DayState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + dateStr)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveState(dateStr: string, state: V2DayState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_PREFIX + dateStr, JSON.stringify(state))
}

export function calcSlotResult(
  slotIndex: number,
  gameId: string,
  correctOrder: string[]
): 'exact' | 'close' | 'wrong' {
  const correctIndex = correctOrder.indexOf(gameId)
  if (correctIndex === slotIndex) return 'exact'
  if (Math.abs(correctIndex - slotIndex) === 1) return 'close'
  return 'wrong'
}

export function calcGuessResults(
  slots: string[],
  correctOrder: string[]
): { correctCount: number; results: ('exact' | 'close' | 'wrong')[] } {
  const results = slots.map((id, i) => calcSlotResult(i, id, correctOrder))
  const correctCount = results.filter(r => r === 'exact').length
  return { correctCount, results }
}

export function calcScoreAfterGuess(currentScore: number, guessNumber: number): number {
  // No penalty on guess 1, -150 for each subsequent guess
  if (guessNumber <= 1) return currentScore
  return Math.max(0, currentScore - GUESS_PENALTY)
}

export function emojiForResult(r: 'exact' | 'close' | 'wrong'): string {
  if (r === 'exact') return '🟩'
  if (r === 'close') return '🟨'
  return '🟥'
}
