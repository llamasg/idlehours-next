// Stock Room — axis criterion catalog.
//
// Each criterion is a labelled predicate over GameEntry. Criterion ids are
// the stable, serialisable reference (day state stores only gameIds; boards
// regenerate deterministically from the date), and every test is a pure
// field check — zero external facts, same verifiability rule as Box Set.
//
// PORTS COUNT: platform criteria mean "ever officially available on that
// platform, INCLUDING ports and remasters" — exactly what the platforms
// field in GAMES_DB records. This is documented here and stated in the
// rules copy, because players WILL dispute it; the answer must be
// consistent and visible.

import type { GameEntry } from '@/data/games-db'

export type CriterionType =
  | 'platform'
  | 'genre'
  | 'era'
  | 'price'
  | 'pegi'
  | 'multiplayer'
  | 'openCritic'

export interface Criterion {
  id: string
  type: CriterionType
  label: string
  test(game: GameEntry): boolean
}

const platform = (value: string, label?: string): Criterion => ({
  id: `platform-${value.toLowerCase().replace(/\s+/g, '-')}`,
  type: 'platform',
  label: label ?? `Playable on ${value}`,
  test: (g) => g.platforms.includes(value),
})

const genre = (value: string, label?: string): Criterion => ({
  id: `genre-${value.toLowerCase()}`,
  type: 'genre',
  label: label ?? `${value} games`,
  test: (g) => g.genres.includes(value),
})

const era = (id: string, label: string, min: number, max: number): Criterion => ({
  id: `era-${id}`,
  type: 'era',
  label,
  test: (g) => g.year >= min && g.year <= max,
})

export const CRITERIA: Criterion[] = [
  // Platforms (ports count — see header)
  platform('PC'),
  platform('Switch'),
  platform('PS5'),
  platform('PS4'),
  platform('PS3'),
  platform('PS2'),
  platform('Xbox One'),
  platform('Xbox 360'),
  platform('Wii'),
  platform('Mobile', 'Playable on mobile'),

  // Genres
  genre('Adventure'),
  genre('RPG', 'RPGs'),
  genre('Shooter', 'Shooters'),
  genre('Strategy'),
  genre('Action'),
  genre('Puzzle'),
  genre('Platform', 'Platformers'),
  genre('Indie'),
  genre('Simulator', 'Simulators'),
  genre('Racing'),
  genre('Fighting'),
  genre('Sport', 'Sports games'),

  // Eras
  era('1990s', 'Released in the 90s', 1990, 1999),
  era('2000s', 'Released in the 2000s', 2000, 2009),
  era('2010s', 'Released in the 2010s', 2010, 2019),
  era('2020s', 'Released in the 2020s', 2020, 2029),
  era('before-2000', 'Released before 2000', 0, 1999),
  era('before-2010', 'Released before 2010', 0, 2009),

  // Price bands (launch price)
  {
    id: 'price-under-20',
    type: 'price',
    label: 'Launched under $20',
    test: (g) => g.launchPriceUsd !== null && g.launchPriceUsd < 20,
  },
  {
    id: 'price-60-plus',
    type: 'price',
    label: 'Launched at $59.99+',
    test: (g) => g.launchPriceUsd !== null && g.launchPriceUsd >= 59.99,
  },

  // PEGI bands
  {
    id: 'pegi-18',
    type: 'pegi',
    label: 'Rated PEGI 18',
    test: (g) => g.pegi === 18,
  },
  {
    id: 'pegi-family',
    type: 'pegi',
    label: 'Family friendly (PEGI 3–7)',
    test: (g) => g.pegi !== null && g.pegi <= 7,
  },

  // Multiplayer
  {
    id: 'multiplayer',
    type: 'multiplayer',
    label: 'Has multiplayer',
    test: (g) => g.multiplayer === true,
  },

  // OpenCritic
  {
    id: 'opencritic-85',
    type: 'openCritic',
    label: 'Critically acclaimed (85+)',
    test: (g) => g.openCritic !== null && g.openCritic >= 85,
  },
]

export const CRITERIA_BY_ID: Map<string, Criterion> = new Map(
  CRITERIA.map((c) => [c.id, c]),
)
