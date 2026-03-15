#!/usr/bin/env node
/**
 * scripts/enrich-games-db.mjs
 *
 * Enriches the unified games-db.ts with IGDB cover art and popularity data.
 *
 * Phase 1: Deduplication (no API) — merge same-title same-year entries
 * Phase 2: IGDB Enrichment (with checkpoint) — fetch cover image IDs
 * Phase 3: Popularity Ranking — assign per-year ranks by IGDB rating count
 * Phase 4: Write Output — regenerate games-db.ts
 *
 * Usage: node scripts/enrich-games-db.mjs [--dedup-only] [--skip-igdb]
 * Requires: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env.local
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const GAMES_DB_PATH = path.resolve(ROOT, 'src/data/games-db.ts')
const CHECKPOINT_PATH = path.join(__dirname, '.enrich-checkpoint.json')

const DEDUP_ONLY = process.argv.includes('--dedup-only')
const SKIP_IGDB = process.argv.includes('--skip-igdb')

// ── Step 1: Read env vars from .env.local ──────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local not found at', envPath)
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) env[match[1]] = match[2].trim()
  }
  return env
}

// ── Twitch OAuth ───────────────────────────────────────────────────────────

async function getTwitchToken(clientId, clientSecret) {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Twitch auth failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  return data.access_token
}

// ── IGDB query helper with retry ───────────────────────────────────────────

async function queryIGDB(token, clientId, endpoint, body, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body,
    })

    if (res.ok) {
      const text = await res.text()
      try {
        return JSON.parse(text)
      } catch {
        console.error(`IGDB response not JSON:`, text.slice(0, 500))
        return []
      }
    }

    const status = res.status
    if ((status === 429 || status >= 500) && attempt < retries) {
      const delay = 1000 * Math.pow(2, attempt - 1) // 1s, 2s, 4s
      console.warn(`  IGDB ${endpoint} returned ${status}, retrying in ${delay}ms (attempt ${attempt}/${retries})`)
      await sleep(delay)
      continue
    }

    const text = await res.text()
    throw new Error(`IGDB ${endpoint} query failed (${status}): ${text}`)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Parse games-db.ts ──────────────────────────────────────────────────────

function parseGamesDb() {
  const content = fs.readFileSync(GAMES_DB_PATH, 'utf8')

  // Find the array start: "export const GAMES_DB..." then the first [
  const exportMatch = content.match(/export\s+const\s+GAMES_DB[^=]*=\s*\[/)
  if (!exportMatch) throw new Error('Cannot find GAMES_DB export in games-db.ts')

  const arrayStart = content.indexOf('[', exportMatch.index)

  // Find the end of the array.
  // Search for the Blitz utilities marker from the END of the file to avoid
  // matching anything inside the array. The ] just before it closes the array.
  const blitzMarker = content.lastIndexOf('\n// ── Blitz utilities')
  let endIdx
  if (blitzMarker !== -1) {
    endIdx = content.lastIndexOf(']', blitzMarker)
  } else {
    // Fallback: find ] before any export function after the array
    const funcMatch = content.lastIndexOf('\nexport function ')
    endIdx = funcMatch !== -1
      ? content.lastIndexOf(']', funcMatch)
      : content.lastIndexOf(']')
  }

  if (arrayStart === -1 || endIdx === -1) throw new Error('Cannot find array bounds in games-db.ts')

  let arrayStr = content.slice(arrayStart, endIdx + 1)

  // Strip comments
  arrayStr = arrayStr.replace(/\/\/[^\n]*/g, '')        // single-line
  arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, '')   // block comments

  // Eval the array
  const fn = new Function(`return ${arrayStr}`)
  const games = fn()

  return { games }
}

// ── Phase 1: Deduplication ─────────────────────────────────────────────────

function scoreEntry(game) {
  let score = 0
  if (game.igdbImageId) score += 10
  if (game.launchPriceUsd != null) score += 5
  if (game.popularityRank != null) score += 5
  if (game.vibe) score += 3
  if (game.genres && game.genres.length > 0) score += 2
  if (game.platforms && game.platforms.length > 0) score += 2
  if (game.openCritic != null) score += 1
  if (game.pegi != null) score += 1
  if (game.tags && game.tags.length > 0) score += 1
  return score
}

function deduplicateGames(games) {
  // Group by lowercase title + year
  const groups = new Map()

  for (const game of games) {
    const key = `${game.title.toLowerCase().trim()}|||${game.year}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(game)
  }

  const deduped = []
  let mergeCount = 0

  for (const [key, group] of groups) {
    if (group.length === 1) {
      deduped.push(group[0])
      continue
    }

    // Sort by score descending — winner has most data
    group.sort((a, b) => scoreEntry(b) - scoreEntry(a))
    const winner = { ...group[0] }

    // Merge unique fields from losers into winner
    for (let i = 1; i < group.length; i++) {
      const loser = group[i]

      // Merge simple nullable fields (only if winner's is null/undefined)
      if (!winner.igdbImageId && loser.igdbImageId) winner.igdbImageId = loser.igdbImageId
      if (winner.launchPriceUsd == null && loser.launchPriceUsd != null) winner.launchPriceUsd = loser.launchPriceUsd
      if (winner.popularityRank == null && loser.popularityRank != null) winner.popularityRank = loser.popularityRank
      if (!winner.vibe && loser.vibe) winner.vibe = loser.vibe
      if (winner.openCritic == null && loser.openCritic != null) winner.openCritic = loser.openCritic
      if (winner.pegi == null && loser.pegi != null) winner.pegi = loser.pegi

      // Merge array fields (union of unique values)
      if (loser.genres && loser.genres.length > 0) {
        const genreSet = new Set([...winner.genres, ...loser.genres])
        winner.genres = [...genreSet]
      }
      if (loser.platforms && loser.platforms.length > 0) {
        const platSet = new Set([...winner.platforms, ...loser.platforms])
        winner.platforms = [...platSet]
      }
      if (loser.tags && loser.tags.length > 0) {
        const tagSet = new Set([...winner.tags, ...loser.tags])
        winner.tags = [...tagSet]
      }

      // multiplayer: true wins
      if (loser.multiplayer) winner.multiplayer = true
    }

    deduped.push(winner)
    mergeCount += group.length - 1
  }

  console.log(`Phase 1: Deduplication`)
  console.log(`  Input: ${games.length} entries`)
  console.log(`  Merged: ${mergeCount} duplicates`)
  console.log(`  Output: ${deduped.length} unique entries`)

  return deduped
}

// ── Checkpoint management ──────────────────────────────────────────────────

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'))
    const meta = data._meta || {}
    console.log(`Loaded checkpoint: ${meta.totalProcessed || 0} games processed (last updated: ${meta.lastUpdated || 'unknown'})`)
    return data
  }
  return { _meta: { totalProcessed: 0, lastUpdated: null } }
}

function saveCheckpoint(checkpoint) {
  checkpoint._meta.lastUpdated = new Date().toISOString()
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf8')
}

// ── Phase 2: IGDB Enrichment ───────────────────────────────────────────────

async function enrichWithIGDB(games) {
  const env = loadEnv()
  const CLIENT_ID = env.TWITCH_CLIENT_ID
  const CLIENT_SECRET = env.TWITCH_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('ERROR: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env.local')
    process.exit(1)
  }

  console.log('\nPhase 2: IGDB Enrichment')
  console.log('Authenticating with Twitch...')
  const token = await getTwitchToken(CLIENT_ID, CLIENT_SECRET)
  console.log('Authenticated successfully')

  const checkpoint = loadCheckpoint()
  let processed = 0
  let skipped = 0
  let enriched = 0

  for (let i = 0; i < games.length; i++) {
    const game = games[i]

    // Skip if already in checkpoint
    if (checkpoint[game.id]) {
      skipped++
      continue
    }

    // Search IGDB for this game
    const escapedTitle = game.title.replace(/"/g, '\\"')
    const yearStart = Math.floor(new Date(`${game.year}-01-01T00:00:00Z`).getTime() / 1000)
    const yearEnd = Math.floor(new Date(`${game.year + 1}-01-01T00:00:00Z`).getTime() / 1000)

    const searchQuery = `search "${escapedTitle}"; where first_release_date >= ${yearStart} & first_release_date < ${yearEnd} & cover != null; fields name, cover, total_rating_count; limit 5;`

    try {
      const results = await queryIGDB(token, CLIENT_ID, 'games', searchQuery)

      if (!results || results.length === 0) {
        // No match found
        checkpoint[game.id] = { igdbImageId: null, igdbRatingCount: 0 }
        processed++
        enriched++
        console.log(`  [${i + 1}/${games.length}] ${game.title} (${game.year}) — no IGDB match`)
      } else {
        // Pick best match: exact title match preferred, else first result
        const exactMatch = results.find(
          (r) => r.name.toLowerCase().trim() === game.title.toLowerCase().trim(),
        )
        const bestMatch = exactMatch || results[0]

        // Fetch cover image_id
        let igdbImageId = null
        if (bestMatch.cover) {
          const coverQuery = `fields image_id; where id = ${bestMatch.cover}; limit 1;`
          const covers = await queryIGDB(token, CLIENT_ID, 'covers', coverQuery)
          await sleep(260)

          if (covers && covers.length > 0) {
            igdbImageId = covers[0].image_id
          }
        }

        const igdbRatingCount = bestMatch.total_rating_count || 0

        checkpoint[game.id] = { igdbImageId, igdbRatingCount }
        processed++
        enriched++

        const matchLabel = exactMatch ? 'exact' : `fuzzy: "${bestMatch.name}"`
        console.log(`  [${i + 1}/${games.length}] ${game.title} (${game.year}) — ${matchLabel}, cover=${igdbImageId || 'none'}, ratings=${igdbRatingCount}`)
      }
    } catch (err) {
      console.error(`  [${i + 1}/${games.length}] ${game.title} (${game.year}) — ERROR: ${err.message}`)
      // Store null so we don't retry
      checkpoint[game.id] = { igdbImageId: null, igdbRatingCount: 0 }
      processed++
    }

    // Save checkpoint every 10 games
    if (processed % 10 === 0) {
      checkpoint._meta.totalProcessed = Object.keys(checkpoint).filter((k) => k !== '_meta').length
      saveCheckpoint(checkpoint)
    }

    // Rate limit: 260ms between requests
    await sleep(260)
  }

  // Final save
  checkpoint._meta.totalProcessed = Object.keys(checkpoint).filter((k) => k !== '_meta').length
  saveCheckpoint(checkpoint)

  console.log(`  Processed: ${processed}, Skipped (cached): ${skipped}, Total in checkpoint: ${checkpoint._meta.totalProcessed}`)

  return checkpoint
}

// ── Apply checkpoint data to games ─────────────────────────────────────────

function applyCheckpoint(games, checkpoint) {
  let applied = 0
  for (const game of games) {
    const cached = checkpoint[game.id]
    if (!cached) continue

    // Only overwrite igdbImageId if game doesn't already have one, or checkpoint has one
    if (cached.igdbImageId) {
      game.igdbImageId = cached.igdbImageId
    }
    applied++
  }
  console.log(`\nApplied checkpoint data to ${applied} games`)
  return games
}

// ── Phase 3: Popularity Ranking ────────────────────────────────────────────

function assignPopularityRanks(games, checkpoint) {
  // Group by year
  const byYear = new Map()
  for (const game of games) {
    if (!byYear.has(game.year)) byYear.set(game.year, [])
    byYear.get(game.year).push(game)
  }

  for (const [year, yearGames] of byYear) {
    // Sort by igdbRatingCount descending (from checkpoint)
    yearGames.sort((a, b) => {
      const countA = checkpoint[a.id]?.igdbRatingCount || 0
      const countB = checkpoint[b.id]?.igdbRatingCount || 0
      return countB - countA
    })

    // Assign ranks 1-N
    for (let i = 0; i < yearGames.length; i++) {
      yearGames[i].popularityRank = i + 1
    }
  }

  console.log(`\nPhase 3: Assigned popularity ranks across ${byYear.size} years`)
  return games
}

// ── Phase 4: Write Output ──────────────────────────────────────────────────

function escapeString(str) {
  if (str == null) return null
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function formatGame(game) {
  const lines = []
  lines.push(`  {`)
  lines.push(`    id: '${escapeString(game.id)}',`)
  lines.push(`    title: '${escapeString(game.title)}',`)
  lines.push(`    year: ${game.year},`)
  lines.push(`    genres: [${game.genres.map((g) => `'${escapeString(g)}'`).join(', ')}],`)
  lines.push(`    platforms: [${game.platforms.map((p) => `'${escapeString(p)}'`).join(', ')}],`)
  lines.push(`    multiplayer: ${game.multiplayer},`)
  lines.push(`    pegi: ${game.pegi === null || game.pegi === undefined ? 'null' : game.pegi},`)
  lines.push(`    openCritic: ${game.openCritic === null || game.openCritic === undefined ? 'null' : game.openCritic},`)
  lines.push(`    vibe: ${game.vibe == null ? 'null' : `'${escapeString(game.vibe)}'`},`)
  lines.push(`    tags: [${game.tags.map((t) => `'${escapeString(t)}'`).join(', ')}],`)
  lines.push(`    igdbImageId: ${game.igdbImageId == null ? 'null' : `'${escapeString(game.igdbImageId)}'`},`)
  lines.push(`    launchPriceUsd: ${game.launchPriceUsd === null || game.launchPriceUsd === undefined ? 'null' : game.launchPriceUsd},`)
  lines.push(`    popularityRank: ${game.popularityRank === null || game.popularityRank === undefined ? 'null' : game.popularityRank},`)
  lines.push(`  },`)
  return lines.join('\n')
}

const BLITZ_SECTION = `
// ── Blitz utilities ─────────────────────────────────────────────────────────

export function getBlitzPool(tag: string): GameEntry[] {
  return GAMES_DB.filter(g => g.tags.includes(tag))
}

export function getBlitzPoolSize(tag: string): number {
  return getBlitzPool(tag).length
}
`

function writeGamesDb(games) {
  // Sort by year then popularityRank
  games.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    const rankA = a.popularityRank ?? 9999
    const rankB = b.popularityRank ?? 9999
    return rankA - rankB
  })

  const header = `// src/data/games-db.ts
// Unified Idle Hours game database — single source of truth for all games.
// Generated by scripts/enrich-games-db.mjs — regenerate after adding data sources.

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

// @ts-ignore — array literal exceeds TS union complexity limit at ~1400+ entries
export const GAMES_DB: GameEntry[] = [
`

  const entries = games.map((g) => formatGame(g)).join('\n')

  const output = header + entries + '\n]\n' + BLITZ_SECTION

  fs.writeFileSync(GAMES_DB_PATH, output, 'utf8')
  console.log(`\nPhase 4: Written ${games.length} games to ${path.relative(ROOT, GAMES_DB_PATH)}`)
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== enrich-games-db.mjs ===\n')

  // Parse
  console.log('Parsing games-db.ts...')
  const { games: rawGames } = parseGamesDb()
  console.log(`Parsed ${rawGames.length} entries\n`)

  // Phase 1: Dedup
  let games = deduplicateGames(rawGames)

  if (DEDUP_ONLY) {
    console.log('\n--dedup-only: writing output without IGDB enrichment')
    writeGamesDb(games)
    return
  }

  // Phase 2: IGDB Enrichment
  let checkpoint
  if (SKIP_IGDB) {
    console.log('\n--skip-igdb: loading existing checkpoint only')
    checkpoint = loadCheckpoint()
  } else {
    checkpoint = await enrichWithIGDB(games)
  }

  // Apply checkpoint data
  games = applyCheckpoint(games, checkpoint)

  // Phase 3: Popularity Ranking
  games = assignPopularityRanks(games, checkpoint)

  // Phase 4: Write output
  writeGamesDb(games)

  // Summary
  const withCover = games.filter((g) => g.igdbImageId != null).length
  const withRank = games.filter((g) => g.popularityRank != null).length
  console.log(`\n=== Summary ===`)
  console.log(`Total games: ${games.length}`)
  console.log(`With cover art: ${withCover} (${((withCover / games.length) * 100).toFixed(1)}%)`)
  console.log(`With popularity rank: ${withRank} (${((withRank / games.length) * 100).toFixed(1)}%)`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
