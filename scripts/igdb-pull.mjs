#!/usr/bin/env node
/**
 * Pull game metadata from IGDB and write unenriched entries to a staging file.
 *
 * Usage: node scripts/igdb-pull.mjs [count]
 *   count — number of new games to pull (default 200)
 *
 * Requires TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env.local
 * Output: scripts/.igdb-staging.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const REQUESTED = parseInt(process.argv[2] || '200', 10)
const BATCH_SIZE = 50
const STAGING_PATH = path.join(__dirname, '.igdb-staging.json')

// ── Read .env.local ─────────────────────────────────────────────────────────

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

const CLIENT_ID = env.TWITCH_CLIENT_ID
const CLIENT_SECRET = env.TWITCH_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env.local')
  process.exit(1)
}

console.log('Loaded credentials from .env.local')

// ── Twitch OAuth ────────────────────────────────────────────────────────────

async function getTwitchToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Twitch auth failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  return data.access_token
}

// ── IGDB query helper ───────────────────────────────────────────────────────

async function queryIGDB(token, endpoint, body) {
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`IGDB ${endpoint} query failed (${res.status}): ${text}`)
  }
  return res.json()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Extract existing IDs from games-db.ts ───────────────────────────────────

function getExistingIds() {
  const dbPath = path.resolve(ROOT, 'src/data/games-db.ts')
  const dbSource = fs.readFileSync(dbPath, 'utf8')
  const arrayMatch = dbSource.match(/export const GAMES_DB:\s*GameEntry\[\]\s*=\s*(\[[\s\S]*\])/)
  if (!arrayMatch) {
    console.error('Could not extract GAMES_DB array from games-db.ts')
    process.exit(1)
  }
  const games = new Function(`return ${arrayMatch[1]}`)()
  const ids = new Set(games.map((g) => g.id))
  console.log(`Existing database: ${ids.size} games`)
  return ids
}

// ── Slugify ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Platform normalisation ──────────────────────────────────────────────────

const PLATFORM_MAP = {
  // PC
  'PC (Microsoft Windows)': 'PC',
  'PC Windows': 'PC',
  'PC DOS': 'PC',
  'Web browser': 'PC',
  'Linux': 'Linux',
  'Mac': 'Mac',

  // Nintendo
  'Nintendo Switch': 'Switch',
  'Wii U': 'Wii U',
  'Wii': 'Wii',
  'Nintendo GameCube': 'GameCube',
  'Nintendo 64': 'N64',
  'Super Nintendo Entertainment System (SNES)': 'SNES',
  'Super Famicom': 'SNES',
  'Nintendo Entertainment System (NES)': 'NES',
  'Family Computer (Famicom)': 'NES',
  'Game Boy Advance': 'Game Boy',
  'Game Boy Color': 'Game Boy',
  'Game Boy': 'Game Boy',
  'Nintendo DS': 'DS',
  'Nintendo DSi': 'DS',
  'Nintendo 3DS': '3DS',
  'New Nintendo 3DS': '3DS',

  // PlayStation
  'PlayStation 5': 'PS5',
  'PlayStation 4': 'PS4',
  'PlayStation 3': 'PS3',
  'PlayStation 2': 'PS2',
  'PlayStation': 'PS1',
  'PlayStation Portable': 'PSP',
  'PlayStation Vita': 'PS Vita',

  // Xbox
  'Xbox Series X|S': 'Xbox Series X',
  'Xbox Series': 'Xbox Series X',
  'Xbox One': 'Xbox One',
  'Xbox 360': 'Xbox 360',
  'Xbox': 'Xbox',

  // Mobile
  'iOS': 'Mobile',
  'Android': 'Mobile',
}

function normalisePlatforms(igdbPlatforms) {
  if (!igdbPlatforms || igdbPlatforms.length === 0) return []
  const mapped = new Set()
  for (const p of igdbPlatforms) {
    const name = p.name || p
    const canonical = PLATFORM_MAP[name]
    if (canonical) mapped.add(canonical)
  }
  return [...mapped]
}

// ── PEGI normalisation ──────────────────────────────────────────────────────

// IGDB age_ratings: category 1=ESRB, 2=PEGI
// PEGI ratings: 1=3, 2=7, 3=12, 4=16, 5=18
// ESRB ratings: 1=RP, 2=EC, 3=E, 4=E10, 5=T, 6=M, 7=AO
const PEGI_RATING_MAP = { 1: 3, 2: 7, 3: 12, 4: 16, 5: 18 }
const ESRB_TO_PEGI = { 2: 3, 3: 3, 4: 7, 5: 12, 6: 16, 7: 18 }

function normalisePegi(ageRatings) {
  if (!ageRatings || ageRatings.length === 0) return null

  // Prefer PEGI (category 2)
  const pegi = ageRatings.find((r) => r.category === 2)
  if (pegi && PEGI_RATING_MAP[pegi.rating]) return PEGI_RATING_MAP[pegi.rating]

  // Fallback to ESRB (category 1)
  const esrb = ageRatings.find((r) => r.category === 1)
  if (esrb && ESRB_TO_PEGI[esrb.rating]) return ESRB_TO_PEGI[esrb.rating]

  return null
}

// ── Genre normalisation ─────────────────────────────────────────────────────

const GENRE_MAP = {
  'Role-playing (RPG)': 'RPG',
  'Real Time Strategy (RTS)': 'Strategy',
  "Hack and slash/Beat 'em up": 'Action',
  'Turn-based strategy (TBS)': 'Strategy',
  'Quiz/Trivia': 'Puzzle',
  'Tactical': 'Strategy',
  'Card & Board Game': 'Strategy',
  'Point-and-click': 'Adventure',
  'Visual Novel': 'Adventure',
  'MOBA': 'Strategy',
  'Pinball': 'Arcade',
}

function normaliseGenres(igdbGenres) {
  if (!igdbGenres || igdbGenres.length === 0) return []
  const mapped = new Set()
  for (const g of igdbGenres) {
    const name = g.name || g
    mapped.add(GENRE_MAP[name] || name)
  }
  return [...mapped]
}

// ── Tag inference ───────────────────────────────────────────────────────────

function inferTags(title, year, genres, keywords) {
  const tags = []
  const t = title.toLowerCase()

  // Decade tag
  const decade = Math.floor(year / 10) * 10
  tags.push(`${decade}s`)

  // Lowercase genre tags
  for (const g of genres) {
    tags.push(g.toLowerCase())
  }

  // IGDB keywords (hyphenated)
  if (keywords) {
    for (const kw of keywords) {
      const name = kw.name || kw
      tags.push(name.toLowerCase().replace(/\s+/g, '-'))
    }
  }

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

  // Deduplicate and ensure minimum 3
  const unique = [...new Set(tags)]
  return unique
}

// ── Multiplayer detection ───────────────────────────────────────────────────

function hasMultiplayer(gameModes) {
  if (!gameModes || gameModes.length === 0) return false
  const mpModes = ['Multiplayer', 'Co-operative', 'Split screen', 'Massively Multiplayer Online (MMO)']
  return gameModes.some((m) => mpModes.includes(m.name || m))
}

// ── Normalise a single IGDB game into a GameEntry ───────────────────────────

function normaliseGame(igdb) {
  const year = igdb.first_release_date
    ? new Date(igdb.first_release_date * 1000).getFullYear()
    : null
  if (!year) return null

  const id = slugify(igdb.name)
  const genres = normaliseGenres(igdb.genres)
  const platforms = normalisePlatforms(igdb.platforms)
  const pegi = normalisePegi(igdb.age_ratings)

  if (platforms.length === 0) return null

  const tags = inferTags(igdb.name, year, genres, igdb.keywords)

  return {
    id,
    title: igdb.name,
    year,
    genres,
    platforms,
    multiplayer: hasMultiplayer(igdb.game_modes),
    pegi,
    openCritic: igdb.total_rating ? Math.round(igdb.total_rating) : null,
    vibe: null,
    tags,
    igdbImageId: igdb.cover?.image_id || null,
    launchPriceUsd: null,
    popularityRank: null,
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const existingIds = getExistingIds()
  const token = await getTwitchToken()
  console.log(`Authenticated with Twitch. Pulling up to ${REQUESTED} new games...`)

  const collected = []
  let offset = 0
  const MAX_OFFSET = 5000 // IGDB hard limit

  while (collected.length < REQUESTED && offset < MAX_OFFSET) {
    const query = [
      'fields name, slug, first_release_date, genres.name, platforms.name,',
      'age_ratings.rating, age_ratings.category, total_rating,',
      'cover.image_id, game_modes.name, keywords.name;',
      'where rating_count > 50 & category = 0 & first_release_date != null;',
      'sort rating_count desc;',
      `limit ${BATCH_SIZE};`,
      `offset ${offset};`,
    ].join('\n')

    const batch = await queryIGDB(token, 'games', query)

    if (batch.length === 0) {
      console.log('No more results from IGDB.')
      break
    }

    for (const igdb of batch) {
      const entry = normaliseGame(igdb)
      if (!entry) continue
      if (existingIds.has(entry.id)) continue

      collected.push(entry)
      existingIds.add(entry.id) // prevent duplicates within this run
      if (collected.length >= REQUESTED) break
    }

    offset += BATCH_SIZE
    console.log(`  Fetched batch at offset ${offset - BATCH_SIZE}: ${batch.length} results, ${collected.length}/${REQUESTED} new games collected`)

    // Rate limit: IGDB allows 4 requests/second
    await sleep(300)
  }

  // Write staging file
  fs.writeFileSync(STAGING_PATH, JSON.stringify(collected, null, 2), 'utf8')
  console.log(`\nDone! ${collected.length} new games written to ${path.relative(ROOT, STAGING_PATH)}`)

  // Summary
  const withPegi = collected.filter((g) => g.pegi !== null).length
  const withCover = collected.filter((g) => g.igdbImageId !== null).length
  const withOC = collected.filter((g) => g.openCritic !== null).length
  console.log(`  PEGI: ${withPegi}/${collected.length}`)
  console.log(`  Cover art: ${withCover}/${collected.length}`)
  console.log(`  Ratings: ${withOC}/${collected.length}`)
  console.log(`  Needs enrichment: vibe + launchPriceUsd (run /idlehours_filldatabase)`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
