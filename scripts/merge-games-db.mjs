// scripts/merge-games-db.mjs
// One-time script to merge Game Sense, Shelf Price, and Street Date databases
// into a single unified games-db.ts file.
// Usage: node scripts/merge-games-db.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ── Parse a TS games file into an array of objects ──────────────────────────

function parseGamesFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')

  // Find the array start: "export const GAMES..." then the first [
  const exportMatch = content.match(/export\s+const\s+GAMES[^=]*=\s*\[/)
  if (!exportMatch) throw new Error(`Cannot find GAMES export in ${filePath}`)

  const arrayStart = content.indexOf('[', exportMatch.index)
  const endIdx = content.lastIndexOf(']')
  if (arrayStart === -1 || endIdx === -1) throw new Error(`Cannot find array in ${filePath}`)

  let arrayStr = content.slice(arrayStart, endIdx + 1)

  // Strip single-line comments (// ...)
  arrayStr = arrayStr.replace(/\/\/[^\n]*/g, '')

  // Wrap in a function and eval
  const fn = new Function(`return ${arrayStr}`)
  return fn()
}

// ── Load all three databases ────────────────────────────────────────────────

console.log('Loading Game Sense database...')
const gsGames = parseGamesFile(path.join(ROOT, 'src/app/play/game-sense/data/games.ts'))
console.log(`  ${gsGames.length} games`)

console.log('Loading Shelf Price database...')
const spGames = parseGamesFile(path.join(ROOT, 'src/app/play/shelf-price/data/games.ts'))
console.log(`  ${spGames.length} games`)

console.log('Loading Street Date database...')
const sdGames = parseGamesFile(path.join(ROOT, 'src/app/play/street-date/data/games.ts'))
console.log(`  ${sdGames.length} games`)

// ── Merge ───────────────────────────────────────────────────────────────────

// Start with Game Sense as base (richest metadata)
const merged = new Map()

for (const g of gsGames) {
  merged.set(g.id, {
    id: g.id,
    title: g.title,
    year: g.year,
    genres: g.genres || [],
    platforms: g.platforms || [],
    multiplayer: g.multiplayer ?? false,
    pegi: g.pegi ?? null,
    openCritic: g.openCritic ?? null,
    vibe: g.vibe || null,
    tags: g.tags || [],
    igdbImageId: null,
    launchPriceUsd: null,
    popularityRank: null,
  })
}

// Merge Shelf Price data
let spMerged = 0, spNew = 0
for (const g of spGames) {
  if (merged.has(g.id)) {
    const existing = merged.get(g.id)
    existing.igdbImageId = existing.igdbImageId || g.igdbImageId
    existing.launchPriceUsd = g.launchPriceUsd
    spMerged++
  } else {
    // New game not in Game Sense — give it sensible defaults
    const tags = inferTags(g.title, g.year)
    merged.set(g.id, {
      id: g.id,
      title: g.title,
      year: g.year,
      genres: [],
      platforms: [],
      multiplayer: false,
      pegi: null,
      openCritic: null,
      vibe: null,
      tags,
      igdbImageId: g.igdbImageId,
      launchPriceUsd: g.launchPriceUsd,
      popularityRank: null,
    })
    spNew++
  }
}
console.log(`Shelf Price: ${spMerged} merged, ${spNew} new entries`)

// Merge Street Date data
let sdMerged = 0, sdNew = 0
for (const g of sdGames) {
  if (merged.has(g.id)) {
    const existing = merged.get(g.id)
    existing.igdbImageId = existing.igdbImageId || g.igdbImageId
    existing.popularityRank = g.popularityRank
    sdMerged++
  } else {
    const tags = inferTags(g.title, g.year)
    merged.set(g.id, {
      id: g.id,
      title: g.title,
      year: g.year,
      genres: [],
      platforms: [],
      multiplayer: false,
      pegi: null,
      openCritic: null,
      vibe: null,
      tags,
      igdbImageId: g.igdbImageId,
      launchPriceUsd: null,
      popularityRank: g.popularityRank,
    })
    sdNew++
  }
}
console.log(`Street Date: ${sdMerged} merged, ${sdNew} new entries`)

// ── Infer basic tags from title/year for games not in Game Sense ────────────

function inferTags(title, year) {
  const tags = []
  const t = title.toLowerCase()

  // Decade tag
  const decade = Math.floor(year / 10) * 10
  tags.push(`${decade}s`)

  // Common franchise/series detection
  if (t.includes('mario')) tags.push('mario', 'nintendo', 'platformer')
  else if (t.includes('zelda')) tags.push('zelda', 'nintendo', 'adventure')
  else if (t.includes('pokemon') || t.includes('pokémon')) tags.push('pokemon', 'nintendo', 'rpg')
  else if (t.includes('final fantasy')) tags.push('final fantasy', 'rpg', 'square enix')
  else if (t.includes('call of duty') || t.includes('cod')) tags.push('call of duty', 'fps', 'shooter')
  else if (t.includes('halo')) tags.push('halo', 'fps', 'shooter', 'xbox')
  else if (t.includes('resident evil')) tags.push('resident evil', 'horror', 'survival')
  else if (t.includes('grand theft auto') || t.includes('gta')) tags.push('gta', 'open world', 'rockstar')
  else if (t.includes('metal gear')) tags.push('metal gear', 'stealth', 'action')
  else if (t.includes('sonic')) tags.push('sonic', 'sega', 'platformer')
  else if (t.includes('street fighter') || t.includes('mortal kombat') || t.includes('tekken')) tags.push('fighting')
  else if (t.includes('fifa') || t.includes('nba') || t.includes('madden') || t.includes('nhl')) tags.push('sports')
  else if (t.includes('need for speed') || t.includes('gran turismo') || t.includes('forza')) tags.push('racing')
  else if (t.includes('sim city') || t.includes('simcity') || t.includes('civilization')) tags.push('simulation', 'strategy')
  else if (t.includes('doom') || t.includes('quake') || t.includes('wolfenstein')) tags.push('fps', 'shooter', 'id software')
  else if (t.includes('castlevania') || t.includes('metroid')) tags.push('metroidvania', 'action')
  else if (t.includes('tomb raider')) tags.push('tomb raider', 'adventure', 'action')
  else if (t.includes('assassin')) tags.push('assassins creed', 'open world', 'action')
  else if (t.includes('dark souls') || t.includes('elden ring') || t.includes('bloodborne')) tags.push('soulslike', 'action', 'fromsoft')

  return tags
}

// ── Sort and output ─────────────────────────────────────────────────────────

const allGames = [...merged.values()]
// Sort by year, then alphabetically by title
allGames.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))

console.log(`\nTotal unified database: ${allGames.length} games`)

// ── Generate TypeScript output ──────────────────────────────────────────────

function escapeStr(s) {
  if (s === null) return 'null'
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
}

function formatArray(arr) {
  if (!arr || arr.length === 0) return '[]'
  return '[' + arr.map(s => escapeStr(s)).join(', ') + ']'
}

function formatEntry(g) {
  const lines = []
  lines.push(`  {`)
  lines.push(`    id: ${escapeStr(g.id)},`)
  lines.push(`    title: ${escapeStr(g.title)},`)
  lines.push(`    year: ${g.year},`)
  lines.push(`    genres: ${formatArray(g.genres)},`)
  lines.push(`    platforms: ${formatArray(g.platforms)},`)
  lines.push(`    multiplayer: ${g.multiplayer},`)
  lines.push(`    pegi: ${g.pegi === null ? 'null' : g.pegi},`)
  lines.push(`    openCritic: ${g.openCritic === null ? 'null' : g.openCritic},`)
  lines.push(`    vibe: ${escapeStr(g.vibe)},`)
  lines.push(`    tags: ${formatArray(g.tags)},`)
  lines.push(`    igdbImageId: ${escapeStr(g.igdbImageId)},`)
  lines.push(`    launchPriceUsd: ${g.launchPriceUsd === null ? 'null' : g.launchPriceUsd},`)
  lines.push(`    popularityRank: ${g.popularityRank === null ? 'null' : g.popularityRank},`)
  lines.push(`  },`)
  return lines.join('\n')
}

const output = `// src/data/games-db.ts
// Unified Idle Hours game database — single source of truth for all games.
// Generated by scripts/merge-games-db.mjs — regenerate after adding data sources.

export interface GameEntry {
  id: string
  title: string
  year: number
  genres: string[]
  platforms: string[]
  multiplayer: boolean
  pegi: number | null
  openCritic: number | null
  vibe: string | null
  tags: string[]
  igdbImageId: string | null
  launchPriceUsd: number | null
  popularityRank: number | null
}

export const GAMES_DB: GameEntry[] = [
${allGames.map(formatEntry).join('\n')}
]

// ── Blitz utilities ─────────────────────────────────────────────────────────

export function getBlitzPool(tag: string): GameEntry[] {
  return GAMES_DB.filter(g => g.tags.includes(tag))
}

export function getBlitzPoolSize(tag: string): number {
  return getBlitzPool(tag).length
}
`

const outPath = path.join(ROOT, 'src/data/games-db.ts')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, output, 'utf8')
console.log(`\nWritten to ${outPath}`)

// Stats
const withVibe = allGames.filter(g => g.vibe).length
const withPrice = allGames.filter(g => g.launchPriceUsd !== null).length
const withRank = allGames.filter(g => g.popularityRank !== null).length
const withImage = allGames.filter(g => g.igdbImageId !== null).length
console.log(`  With vibe: ${withVibe}`)
console.log(`  With price: ${withPrice}`)
console.log(`  With popularity rank: ${withRank}`)
console.log(`  With IGDB image: ${withImage}`)
