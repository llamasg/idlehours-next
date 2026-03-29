// Rank systems for all daily games — thresholds, names, and flavour text.
// Used by ResultCard rank ladder and DailyBadgeShelf.

import {
  getGameSenseRank,
  getStreetDateRank,
  getShelfPriceRank,
  GAME_SENSE_FLAVOUR,
  STREET_DATE_FLAVOUR,
  SHELF_PRICE_FLAVOUR,
} from '@/components/games/GameEndModal.copy'

// Re-export the rank functions for convenience
export { getGameSenseRank, getStreetDateRank, getShelfPriceRank }
export { GAME_SENSE_FLAVOUR, STREET_DATE_FLAVOUR, SHELF_PRICE_FLAVOUR }

export interface RankThreshold {
  name: string
  label: string // e.g. "0–349 pts" or "4–6 streak"
}

export const GAME_SENSE_LADDER: RankThreshold[] = [
  { name: 'Bust', label: '0 pts' },
  { name: 'Keep Guessing', label: '1\u2013349 pts' },
  { name: 'Getting Warmer', label: '350\u2013599 pts' },
  { name: 'Well Played', label: '600\u2013799 pts' },
  { name: 'Encyclopaedic', label: '800+ pts' },
]

export const STREET_DATE_LADDER: RankThreshold[] = [
  { name: 'Bust', label: '0 pts' },
  { name: 'New to the Medium', label: '1\u2013349 pts' },
  { name: 'Occasional Player', label: '350\u2013599 pts' },
  { name: 'Retro Head', label: '600\u2013799 pts' },
  { name: 'Time Archivist', label: '800+ pts' },
]

export const SHELF_PRICE_LADDER: RankThreshold[] = [
  { name: 'Bust', label: '0 pts' },
  { name: 'Just Another Consumer', label: '100\u2013300 pts' },
  { name: 'Junior Dev', label: '400\u2013600 pts' },
  { name: 'Senior Producer', label: '700\u2013900 pts' },
  { name: 'Industry Insider', label: '1000 pts' },
]

export type GameSlug = 'game-sense' | 'street-date' | 'shelf-price'

/** Per-game accent colours for badges, scores, and highlights */
export const GAME_COLORS: Record<GameSlug, {
  accent: string       // CSS colour for text/bg accents
  shadow: string       // rgba shadow for badge glow
  confetti: string[]   // confetti palette
}> = {
  'game-sense': {
    accent: 'hsl(var(--game-blue))',
    shadow: 'rgba(74,143,232,0.35)',
    confetti: ['#4A8FE8', '#C8873A', '#27A85A', '#F0EBE0', '#2D6BC4'],
  },
  'street-date': {
    accent: 'hsl(var(--game-green))',
    shadow: 'rgba(39,168,90,0.35)',
    confetti: ['#27A85A', '#1A7A40', '#C8873A', '#F0EBE0', '#4A8FE8'],
  },
  'shelf-price': {
    accent: '#5B4FCF',
    shadow: 'rgba(91,79,207,0.35)',
    confetti: ['#5B4FCF', '#7B6FE8', '#C8873A', '#F0EBE0', '#4A8FE8'],
  },
}

export function getLadderForGame(game: GameSlug): RankThreshold[] {
  switch (game) {
    case 'game-sense': return GAME_SENSE_LADDER
    case 'street-date': return STREET_DATE_LADDER
    case 'shelf-price': return SHELF_PRICE_LADDER
  }
}

export function getRankForGame(game: GameSlug, score: number, streak: number): string {
  switch (game) {
    case 'game-sense': return getGameSenseRank(score)
    case 'street-date': return getStreetDateRank(score)
    case 'shelf-price': return getShelfPriceRank(score)
  }
}

export function getFlavourForGame(game: GameSlug): Record<string, string[]> {
  switch (game) {
    case 'game-sense': return GAME_SENSE_FLAVOUR
    case 'street-date': return STREET_DATE_FLAVOUR
    case 'shelf-price': return SHELF_PRICE_FLAVOUR
  }
}
