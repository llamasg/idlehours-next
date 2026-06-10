// State shape + store live in the game-shell registry; this module binds
// them with the game's scoring helpers.
import { streetDateStore, type StreetDateDayState } from '@/lib/game-shell/registry'

export type V2DayState = StreetDateDayState

const MAX_GUESSES = 5
const BASE_SCORE = 1000
const GUESS_PENALTY = 150
const HINT_ONE_COST = 100
const HINT_ALL_COST = 300

export { MAX_GUESSES, HINT_ONE_COST, HINT_ALL_COST }

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
  return streetDateStore.load(dateStr)
}

export function saveState(dateStr: string, state: V2DayState): void {
  streetDateStore.save(dateStr, state)
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
