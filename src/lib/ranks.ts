// Rank systems for all daily games — thresholds, names, and flavour text.
// Used by ResultCard rank ladder and DailyBadgeShelf.

import {
  getGameSenseRank,
  getStreetDateRank,
  getShelfPriceRank,
  getBoxSetRank,
  GAME_SENSE_FLAVOUR,
  STREET_DATE_FLAVOUR,
  SHELF_PRICE_FLAVOUR,
  BOX_SET_FLAVOUR,
} from '@/components/games/GameEndModal.copy'

export interface RankThreshold {
  name: string
  label: string // e.g. "0–349 pts" or "4–6 streak"
}

const GAME_SENSE_LADDER: RankThreshold[] = [
  { name: 'Bust', label: '0 pts' },
  { name: 'Skill Issue', label: '1\u2013349 pts' },
  { name: 'Button Masher', label: '350\u2013599 pts' },
  { name: 'Big Brain', label: '600\u2013998 pts' },
  { name: 'One Shot', label: '999 pts' },
]

const STREET_DATE_LADDER: RankThreshold[] = [
  { name: 'Bust', label: '0 pts' },
  { name: 'Newbie', label: '1\u2013349 pts' },
  { name: 'Has a Backlog', label: '350\u2013599 pts' },
  { name: 'Day One', label: '600\u2013999 pts' },
  { name: 'The Curator', label: '1000 pts' },
]

const SHELF_PRICE_LADDER: RankThreshold[] = [
  { name: 'Bust', label: '0 pts' },
  { name: 'Moms Credit Card', label: '100\u2013300 pts' },
  { name: 'Bargain Hunter', label: '400\u2013600 pts' },
  { name: 'Secret Shopper', label: '700\u2013999 pts' },
  { name: 'Head of Sales', label: '1000 pts' },
]

const BOX_SET_LADDER: RankThreshold[] = [
  { name: 'Bust', label: '0 pts' },
  { name: 'Shovelware', label: '250 pts' },
  { name: 'Starter Pack', label: '500 pts' },
  { name: 'Limited Edition', label: '750 pts' },
  { name: "Collector's Edition", label: '1000 pts' },
]

/** The daily games — rank ladders, badges, and themes exist for these. */
export type DailyGameSlug = 'game-sense' | 'street-date' | 'shelf-price' | 'box-set'

/** Every game on the site. Type-level prep for the badges/accounts work —
 *  session games have no rank ladder or theme yet. */
export type GameSlug = DailyGameSlug | 'blitz' | 'jigsaw' | 'ship-it'

/** Badge artwork per rank name — single source of truth (was duplicated
 *  verbatim in DailyBadgeShelf and ResultCard). */
export const BADGE_IMAGES: Record<string, string> = {
  // Universal
  'Bust': '/images/badges/00_BUST.png',
  // Game Sense
  'Skill Issue': '/images/badges/Game Sense_01__Skill Issue.png',
  'Button Masher': '/images/badges/Game Sense_02_Button Masher.png',
  'Big Brain': '/images/badges/Game Sense_03_Big Brain.png',
  'One Shot': '/images/badges/Game Sense_04_One Shot.png',
  // Street Date
  'Newbie': '/images/badges/Street Date_01_Newbie.png',
  'Has a Backlog': '/images/badges/Street Date_02_Has a Backlog.png',
  'Day One': '/images/badges/Street Date_03_Day One.png',
  'The Curator': '/images/badges/Street Date_04_The Curator.png',
  // Shelf Price
  'Moms Credit Card': '/images/badges/Shelf Price_01_Moms Credit card.png',
  'Bargain Hunter': '/images/badges/Shelf Price_02_bargain hunter.png',
  'Secret Shopper': '/images/badges/Shelf Price_03_Secret Shopper.png',
  'Head of Sales': '/images/badges/Shelf Price_04_head of sales.png',
}

/** Full per-game theme: accents, badge glow, confetti, world chrome. */
export interface GameTheme {
  accent: string       // CSS colour for text/bg accents
  accentDark: string   // darker shade for 3D button shadows
  shadow: string       // rgba shadow for badge glow
  confetti: string[]   // confetti palette
  worldGradient: string // the game world background
  statusBarHex: string  // mobile status-bar / theme-color hex
}

export const GAME_THEME: Record<DailyGameSlug, GameTheme> = {
  'game-sense': {
    accent: 'hsl(var(--game-blue))',
    accentDark: '#2d6bc4',
    shadow: 'rgba(74,143,232,0.35)',
    confetti: ['#4A8FE8', '#C8873A', '#27A85A', '#F0EBE0', '#2D6BC4'],
    worldGradient: 'linear-gradient(to bottom, #2D6BC4, #1a2a4a)',
    statusBarHex: '#2D6BC4',
  },
  'street-date': {
    accent: 'hsl(var(--game-green))',
    accentDark: '#1A7A40',
    shadow: 'rgba(39,168,90,0.35)',
    confetti: ['#27A85A', '#1A7A40', '#C8873A', '#F0EBE0', '#4A8FE8'],
    worldGradient: 'linear-gradient(155deg, #1A7A40, #0d1f12)',
    statusBarHex: '#1A7A40',
  },
  'shelf-price': {
    accent: 'hsl(var(--game-purple))', // = #5B4FCF
    accentDark: '#3D35A0',
    shadow: 'rgba(91,79,207,0.35)',
    confetti: ['#5B4FCF', '#7B6FE8', '#C8873A', '#F0EBE0', '#4A8FE8'],
    worldGradient: 'linear-gradient(155deg, #5B4FCF, #1a1040)',
    statusBarHex: '#5B4FCF',
  },
  // Box Set block-out theme — amber suggested, FLAGGED FOR REVIEW
  'box-set': {
    accent: 'hsl(var(--game-amber))', // ≈ #C8873A
    accentDark: '#8a5a26',
    shadow: 'rgba(200,135,58,0.35)',
    confetti: ['#C8873A', '#E8B05C', '#27A85A', '#F0EBE0', '#4A8FE8'],
    worldGradient: 'linear-gradient(155deg, #C8873A, #2b1d0e)',
    statusBarHex: '#C8873A',
  },
}

export function getLadderForGame(game: DailyGameSlug): RankThreshold[] {
  switch (game) {
    case 'game-sense': return GAME_SENSE_LADDER
    case 'street-date': return STREET_DATE_LADDER
    case 'shelf-price': return SHELF_PRICE_LADDER
    case 'box-set': return BOX_SET_LADDER
  }
}

export function getRankForGame(game: DailyGameSlug, score: number, streak: number): string {
  switch (game) {
    case 'game-sense': return getGameSenseRank(score)
    case 'street-date': return getStreetDateRank(score)
    case 'shelf-price': return getShelfPriceRank(score)
    case 'box-set': return getBoxSetRank(score)
  }
}

export function getFlavourForGame(game: DailyGameSlug): Record<string, string[]> {
  switch (game) {
    case 'game-sense': return GAME_SENSE_FLAVOUR
    case 'street-date': return STREET_DATE_FLAVOUR
    case 'shelf-price': return SHELF_PRICE_FLAVOUR
    case 'box-set': return BOX_SET_FLAVOUR
  }
}
