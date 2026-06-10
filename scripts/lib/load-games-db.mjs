// Loads GAMES_DB from src/data/games-db.ts in plain Node by stripping the
// TS-only parts and dynamic-importing the result. Used by the Box Set seed
// and assembly scripts (the older db scripts regex-parse the file; this gives
// full structured entries).

import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

export async function loadGamesDb() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/games-db.ts'), 'utf8')
  const body = src
    .replace(/export interface GameEntry \{[\s\S]*?\n\}/, '')
    .replace(/\/\/ @ts-ignore[^\n]*\n/, '')
    .replace('export const GAMES_DB: GameEntry[] =', 'export const GAMES_DB =')

  const tmp = path.join(os.tmpdir(), `games-db-${process.pid}-${Date.now()}.mjs`)
  fs.writeFileSync(tmp, body)
  try {
    const mod = await import(pathToFileURL(tmp).href)
    return mod.GAMES_DB
  } finally {
    fs.unlinkSync(tmp)
  }
}
