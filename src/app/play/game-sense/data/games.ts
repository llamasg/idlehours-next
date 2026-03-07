// Game Sense — filtered view of the shared Idle Hours game database.

import { GAMES_DB, type GameEntry } from '@/data/games-db'

export type GameSenseGame = GameEntry & {
  vibe: string
  genres: string[]
  platforms: string[]
  pegi: number
}

export const GAMES: GameSenseGame[] = GAMES_DB.filter(
  (g): g is GameSenseGame =>
    g.vibe !== null &&
    g.genres.length > 0 &&
    g.platforms.length > 0 &&
    g.pegi !== null
)
