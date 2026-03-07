// Shelf Price — filtered view of the shared Idle Hours game database.

import { GAMES_DB, type GameEntry } from '@/data/games-db'

export type ShelfPriceGame = GameEntry & {
  launchPriceUsd: number
  igdbImageId: string
}

export const GAMES: ShelfPriceGame[] = GAMES_DB.filter(
  (g): g is ShelfPriceGame =>
    g.launchPriceUsd !== null &&
    g.igdbImageId !== null
)
