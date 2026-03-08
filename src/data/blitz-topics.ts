import { type GameEntry } from './games-db'

export interface BlitzTopic {
  slug: string
  name: string
  prompt: string
  icon: string
  group: 'franchise' | 'platform' | 'year' | 'genre'
  filter: (game: GameEntry) => boolean
}

export const BLITZ_TOPICS: BlitzTopic[] = [
  // ── Franchise ──
  {
    slug: 'mario',
    name: 'Mario Games',
    prompt: 'Name any game with Mario in the title',
    icon: '🍄',
    group: 'franchise',
    filter: (g) => g.title.toLowerCase().includes('mario'),
  },
  {
    slug: 'zelda',
    name: 'Zelda Games',
    prompt: 'Name any game in the Zelda series',
    icon: '🗡️',
    group: 'franchise',
    filter: (g) => g.title.toLowerCase().includes('zelda'),
  },
  {
    slug: 'final-fantasy',
    name: 'Final Fantasy',
    prompt: 'Name any Final Fantasy game',
    icon: '⚔️',
    group: 'franchise',
    filter: (g) => g.title.toLowerCase().includes('final fantasy'),
  },
  {
    slug: 'pokemon',
    name: 'Pokémon Games',
    prompt: 'Name any Pokémon game',
    icon: '⚡',
    group: 'franchise',
    filter: (g) => g.title.toLowerCase().includes('pok\u00e9mon') || g.title.toLowerCase().includes('pokemon'),
  },
  {
    slug: 'fromsoftware',
    name: 'FromSoftware',
    prompt: 'Name any game by FromSoftware',
    icon: '🛡️',
    group: 'franchise',
    filter: (g) =>
      /dark souls|elden ring|bloodborne|sekiro|armored core|demon['']?s? souls|king['']?s field/i.test(g.title),
  },

  // ── Platform ──
  {
    slug: 'n64',
    name: 'Nintendo 64',
    prompt: 'Name any N64 game',
    icon: '🕹️',
    group: 'platform',
    filter: (g) => g.platforms.includes('N64'),
  },
  {
    slug: 'snes',
    name: 'SNES',
    prompt: 'Name any Super Nintendo game',
    icon: '🎮',
    group: 'platform',
    filter: (g) => g.platforms.includes('SNES'),
  },
  {
    slug: 'gamecube',
    name: 'GameCube',
    prompt: 'Name any GameCube game',
    icon: '🟪',
    group: 'platform',
    filter: (g) => g.platforms.includes('GameCube'),
  },

  // ── Year ──
  {
    slug: '2011',
    name: 'Class of 2011',
    prompt: 'Name any game released in 2011',
    icon: '🗓️',
    group: 'year',
    filter: (g) => g.year === 2011,
  },

  // ── Genre ──
  {
    slug: 'platformer',
    name: 'Platformers',
    prompt: 'Name any platforming game',
    icon: '🦘',
    group: 'genre',
    filter: (g) => g.genres.includes('Platformer'),
  },
  {
    slug: 'horror',
    name: 'Horror Games',
    prompt: 'Name any horror game',
    icon: '👻',
    group: 'genre',
    filter: (g) =>
      g.genres.some((x) => x.toLowerCase().includes('horror')) ||
      g.tags.includes('horror'),
  },
]
