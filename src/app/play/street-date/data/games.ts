// Street Date — filtered view of the shared Idle Hours game database.

import { GAMES_DB, type GameEntry } from '@/data/games-db'

export type StreetDateGame = GameEntry & {
  igdbImageId: string
  popularityRank: number
}

export const GAMES: StreetDateGame[] = GAMES_DB.filter(
  (g): g is StreetDateGame =>
    g.igdbImageId !== null &&
    g.popularityRank !== null
)
