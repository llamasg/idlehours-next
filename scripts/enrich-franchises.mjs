#!/usr/bin/env node
/**
 * scripts/enrich-franchises.mjs
 *
 * Adds a `franchise` field to games-db.ts from IGDB franchise/collection
 * data (Box Set yellow tier needs franchise groups — June 2026 re-tier).
 *
 * Unlike enrich-games-db.mjs this does NOT dedup or re-rank: every existing
 * field is preserved verbatim; the only change is the new field. Searches
 * IGDB by title+year (house pattern), prefers the main `franchise`, then
 * `franchises[0]`, then `collection`, then `collections[0]`.
 *
 * Usage: node scripts/enrich-franchises.mjs [--limit N] [--apply-only]
 *   --limit N      stop after N uncached games (smoke testing)
 *   --apply-only   skip the API, just apply the checkpoint + write output
 * Requires: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env.local
 * Checkpoint: scripts/.franchise-checkpoint.json (resume-safe)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const GAMES_DB_PATH = path.resolve(ROOT, 'src/data/games-db.ts')
const CHECKPOINT_PATH = path.join(__dirname, '.franchise-checkpoint.json')

const limitIdx = process.argv.indexOf('--limit')
const LIMIT = limitIdx !== -1 ? Number(process.argv[limitIdx + 1]) : Infinity
const APPLY_ONLY = process.argv.includes('--apply-only')

// ── Env / auth / query helpers (house pattern from enrich-games-db.mjs) ─────

function loadEnv() {
  const envPath = path.resolve(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local not found at', envPath)
    process.exit(1)
  }
  const env = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) env[match[1]] = match[2].trim()
  }
  return env
}

async function getTwitchToken(clientId, clientSecret) {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  )
  if (!res.ok) throw new Error(`Twitch auth failed (${res.status}): ${await res.text()}`)
  return (await res.json()).access_token
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
        console.error('IGDB response not JSON:', text.slice(0, 300))
        return []
      }
    }
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const delay = 1000 * Math.pow(2, attempt - 1)
      console.warn(`  IGDB ${res.status}, retrying in ${delay}ms (${attempt}/${retries})`)
      await sleep(delay)
      continue
    }
    throw new Error(`IGDB ${endpoint} failed (${res.status}): ${await res.text()}`)
  }
}

// ── Parse games-db.ts (house pattern) ────────────────────────────────────────

function parseGamesDb() {
  const content = fs.readFileSync(GAMES_DB_PATH, 'utf8')
  const exportMatch = content.match(/export\s+const\s+GAMES_DB[^=]*=\s*\[/)
  if (!exportMatch) throw new Error('Cannot find GAMES_DB export')
  const arrayStart = content.indexOf('[', exportMatch.index)
  const blitzMarker = content.lastIndexOf('\n// ── Blitz utilities')
  const endIdx = blitzMarker !== -1
    ? content.lastIndexOf(']', blitzMarker)
    : content.lastIndexOf(']')
  let arrayStr = content.slice(arrayStart, endIdx + 1)
  arrayStr = arrayStr.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
  return new Function(`return ${arrayStr}`)()
}

// ── Checkpoint ───────────────────────────────────────────────────────────────

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'))
    console.log(`Loaded checkpoint: ${Object.keys(data).filter((k) => k !== '_meta').length} games cached`)
    return data
  }
  return { _meta: {} }
}

function saveCheckpoint(checkpoint) {
  checkpoint._meta.lastUpdated = new Date().toISOString()
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf8')
}

// ── Enrichment ───────────────────────────────────────────────────────────────

async function enrich(games) {
  const env = loadEnv()
  const { TWITCH_CLIENT_ID: id, TWITCH_CLIENT_SECRET: secret } = env
  if (!id || !secret) {
    console.error('ERROR: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env.local')
    process.exit(1)
  }

  console.log('Authenticating with Twitch...')
  const token = await getTwitchToken(id, secret)
  console.log('Authenticated.\n')

  const checkpoint = loadCheckpoint()
  let fetched = 0

  for (let i = 0; i < games.length; i++) {
    const game = games[i]
    if (checkpoint[game.id] !== undefined) continue
    if (fetched >= LIMIT) break

    const escapedTitle = game.title.replace(/"/g, '\\"')
    const yearStart = Math.floor(new Date(`${game.year}-01-01T00:00:00Z`).getTime() / 1000)
    const yearEnd = Math.floor(new Date(`${game.year + 1}-01-01T00:00:00Z`).getTime() / 1000)
    const query =
      `search "${escapedTitle}"; ` +
      `where first_release_date >= ${yearStart} & first_release_date < ${yearEnd}; ` +
      `fields name, franchise.name, franchises.name, collection.name, collections.name; limit 5;`

    try {
      const results = await queryIGDB(token, id, 'games', query)
      const exact = results?.find(
        (r) => r.name.toLowerCase().trim() === game.title.toLowerCase().trim(),
      )
      const best = exact || results?.[0]
      const franchise =
        best?.franchise?.name ??
        best?.franchises?.[0]?.name ??
        best?.collection?.name ??
        best?.collections?.[0]?.name ??
        null
      checkpoint[game.id] = franchise
      console.log(
        `  [${i + 1}/${games.length}] ${game.title} (${game.year}) — ` +
          `${franchise ?? 'no franchise'}${best ? (exact ? '' : ` (fuzzy: "${best.name}")`) : ' (no match)'}`,
      )
    } catch (err) {
      console.error(`  [${i + 1}/${games.length}] ${game.title} — ERROR: ${err.message}`)
      checkpoint[game.id] = null
    }

    fetched++
    if (fetched % 10 === 0) saveCheckpoint(checkpoint)
    await sleep(260)
  }

  saveCheckpoint(checkpoint)
  return checkpoint
}

// ── Write output (house format + franchise) ──────────────────────────────────

function escapeString(str) {
  if (str == null) return null
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function formatGame(game) {
  return [
    `  {`,
    `    id: '${escapeString(game.id)}',`,
    `    title: '${escapeString(game.title)}',`,
    `    year: ${game.year},`,
    `    genres: [${game.genres.map((g) => `'${escapeString(g)}'`).join(', ')}],`,
    `    platforms: [${game.platforms.map((p) => `'${escapeString(p)}'`).join(', ')}],`,
    `    multiplayer: ${game.multiplayer},`,
    `    pegi: ${game.pegi ?? 'null'},`,
    `    openCritic: ${game.openCritic ?? 'null'},`,
    `    vibe: ${game.vibe == null ? 'null' : `'${escapeString(game.vibe)}'`},`,
    `    tags: [${game.tags.map((t) => `'${escapeString(t)}'`).join(', ')}],`,
    `    igdbImageId: ${game.igdbImageId == null ? 'null' : `'${escapeString(game.igdbImageId)}'`},`,
    `    launchPriceUsd: ${game.launchPriceUsd ?? 'null'},`,
    `    popularityRank: ${game.popularityRank ?? 'null'},`,
    `    franchise: ${game.franchise == null ? 'null' : `'${escapeString(game.franchise)}'`},`,
    `  },`,
  ].join('\n')
}

function writeGamesDb(games) {
  // NO re-sort, NO dedup — parse order preserved, data preserved.
  const header = `// src/data/games-db.ts
// Unified Idle Hours game database — single source of truth for all games.
// Generated by scripts/enrich-games-db.mjs — regenerate after adding data sources.
// franchise field added by scripts/enrich-franchises.mjs (IGDB franchise/collection).

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
  /** IGDB franchise (fallback: collection) — Box Set yellow franchise groups. */
  franchise: string | null
}

// @ts-ignore — array literal exceeds TS union complexity limit at ~1400+ entries
export const GAMES_DB: GameEntry[] = [
`
  const entries = games.map(formatGame).join('\n')
  fs.writeFileSync(GAMES_DB_PATH, header + entries + '\n]\n', 'utf8')
  console.log(`\nWritten ${games.length} games to ${path.relative(ROOT, GAMES_DB_PATH)}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== enrich-franchises.mjs ===\n')
  const games = parseGamesDb()
  console.log(`Parsed ${games.length} entries`)

  const checkpoint = APPLY_ONLY ? loadCheckpoint() : await enrich(games)

  let withFranchise = 0
  for (const game of games) {
    game.franchise = checkpoint[game.id] ?? null
    if (game.franchise) withFranchise++
  }

  const uncached = games.filter((g) => checkpoint[g.id] === undefined).length
  if (uncached > 0) {
    console.log(`\nNOTE: ${uncached} games not yet fetched (limit or interrupt) — written as null; re-run to fill.`)
  }

  writeGamesDb(games)

  // Franchise group sizes — the yellow-tier feedstock
  const counts = new Map()
  for (const game of games) {
    if (game.franchise) counts.set(game.franchise, (counts.get(game.franchise) ?? 0) + 1)
  }
  const groupable = [...counts.entries()].filter(([, n]) => n >= 4)
  console.log(`\n=== Summary ===`)
  console.log(`With franchise: ${withFranchise}/${games.length}`)
  console.log(`Distinct franchises: ${counts.size}; with ≥4 members (yellow feedstock): ${groupable.length}`)
  console.log(
    groupable
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, n]) => `  ${name}: ${n}`)
      .join('\n'),
  )
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
