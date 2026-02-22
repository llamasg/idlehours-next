// src/app/games/Skill_Issue/lib/scoring.ts

import type { SkillIssueGame } from '../data/games'

/** Jaccard distance: 1 - (intersection / union). Returns 0-1. */
function jaccardDistance(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter((x) => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  if (union === 0) return 0
  return 1 - intersection / union
}

/** PEGI ratings in order. Distance is the step count between them. */
const PEGI_ORDER = [3, 7, 12, 16, 18]
function pegiDistance(a: number, b: number): number {
  const idxA = PEGI_ORDER.indexOf(a)
  const idxB = PEGI_ORDER.indexOf(b)
  if (idxA === -1 || idxB === -1) return 1
  return Math.abs(idxA - idxB) / (PEGI_ORDER.length - 1)
}

/**
 * Calculate proximity between a guessed game and the answer.
 * Returns 1–1000 where 1 = correct, 1000 = maximally far.
 */
export function calculateProximity(
  guess: SkillIssueGame,
  answer: SkillIssueGame,
): number {
  if (guess.id === answer.id) return 1

  // Genre overlap: up to 300
  const genreScore = jaccardDistance(guess.genres, answer.genres) * 300

  // Year difference: up to 200 (1 point per year, capped)
  const yearScore = Math.min(Math.abs(guess.year - answer.year), 200)

  // Platform overlap: up to 150
  const platformScore = jaccardDistance(guess.platforms, answer.platforms) * 150

  // Multiplayer match: 0 or 100
  const multiplayerScore = guess.multiplayer === answer.multiplayer ? 0 : 100

  // PEGI match: up to 150
  const pegiScore = pegiDistance(guess.pegi, answer.pegi) * 150

  // OpenCritic difference: up to 100 (null treated as 50)
  const guessOC = guess.openCritic ?? 50
  const answerOC = answer.openCritic ?? 50
  const ocScore = (Math.min(Math.abs(guessOC - answerOC), 100) / 100) * 100

  const total = genreScore + yearScore + platformScore + multiplayerScore + pegiScore + ocScore

  // Clamp to 2–1000 (1 is reserved for exact match)
  return Math.max(2, Math.min(1000, Math.round(total)))
}
