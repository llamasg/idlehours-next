// scripts/generate-street-date-data.mjs
// Generates Street Date game data by querying IGDB API
// Usage: node scripts/generate-street-date-data.mjs
// Requires: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env.local

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

// ── Step 1: Read env vars from .env.local ──────────────────────────────────────

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

console.log('Loaded Twitch credentials from .env.local')

// ── Step 2: Get Twitch OAuth token ─────────────────────────────────────────────

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

// ── Step 3: Query IGDB endpoints ───────────────────────────────────────────────

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

// ── Slugify helper ─────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Escape single quotes for TypeScript string literals ────────────────────────

function escapeTitle(title) {
  return title.replace(/'/g, "\\'")
}

// ── Step 4: Fetch games for each year ──────────────────────────────────────────

async function main() {
  console.log('Authenticating with Twitch...')
  const token = await getTwitchToken()
  console.log('Authenticated successfully\n')

  const TARGET_YEARS = Array.from({ length: 36 }, (_, i) => 1990 + i) // 1990-2025
  const MIN_GAMES = 5

  const allGames = []
  const validYears = []

  for (const year of TARGET_YEARS) {
    const startTimestamp = Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000)
    const endTimestamp = Math.floor(new Date(`${year + 1}-01-01T00:00:00Z`).getTime() / 1000)

    // Query top games for this year sorted by total_rating_count
    // Note: category field is often null in IGDB, so we skip that filter.
    // Sorting by total_rating_count desc naturally surfaces main games over DLC.
    const query = `
      fields name, cover, first_release_date, total_rating_count;
      where first_release_date >= ${startTimestamp}
        & first_release_date < ${endTimestamp}
        & cover != null
        & total_rating_count > 0;
      sort total_rating_count desc;
      limit 30;
    `

    try {
      const games = await queryIGDB(token, 'games', query)

      // Sleep 300ms between requests (IGDB rate limit: 4 req/sec)
      await new Promise((r) => setTimeout(r, 300))

      // Filter to games with a cover ID (integer reference)
      const withCovers = games.filter((g) => g.cover)

      if (withCovers.length < MIN_GAMES) {
        console.log(`${year}: Only ${withCovers.length} games with covers — SKIPPING`)
        continue
      }

      // Resolve cover image_ids via the /covers endpoint
      const coverIds = withCovers.map((g) => g.cover)
      const coverQuery = `fields game, image_id; where id = (${coverIds.join(',')}); limit 30;`
      const covers = await queryIGDB(token, 'covers', coverQuery)

      await new Promise((r) => setTimeout(r, 300))

      // Build a map: game_id -> image_id
      const coverMap = {}
      for (const c of covers) {
        coverMap[c.game] = c.image_id
      }

      // Attach image_id to each game
      const enriched = withCovers
        .map((g) => ({ ...g, imageId: coverMap[g.id] }))
        .filter((g) => g.imageId)

      if (enriched.length < MIN_GAMES) {
        console.log(`${year}: Only ${enriched.length} games with resolved covers — SKIPPING`)
        continue
      }

      // Pick games at different popularity tiers to create obscure -> iconic gradient
      // Tier 1 (rank 1, most obscure): further down the list
      // Tier 5 (rank 5, most iconic): top of the list (index 0)
      const indices =
        enriched.length >= 15
          ? [Math.min(14, enriched.length - 1), Math.min(9, enriched.length - 1), 5, 2, 0]
          : enriched.length >= 10
            ? [Math.min(9, enriched.length - 1), 6, 4, 2, 0]
            : [Math.min(4, enriched.length - 1), 3, 2, 1, 0]

      const selected = indices.map((idx, rank) => ({
        id: slugify(enriched[idx].name),
        title: enriched[idx].name,
        year,
        igdbImageId: enriched[idx].imageId,
        popularityRank: rank + 1,
      }))

      allGames.push(...selected)
      validYears.push(year)
      console.log(`${year}: ${enriched.length} games found, selected 5`)
    } catch (err) {
      console.error(`${year}: ERROR — ${err.message}`)
    }
  }

  // ── Step 5: Write output files ─────────────────────────────────────────────

  const dataDir = path.resolve(ROOT, 'src/app/play/street-date/data')

  // Group games by year with comment headers
  const gamesByYear = {}
  for (const g of allGames) {
    if (!gamesByYear[g.year]) gamesByYear[g.year] = []
    gamesByYear[g.year].push(g)
  }

  const gameEntries = []
  for (const year of validYears) {
    gameEntries.push(`  // ── ${year} ${'─'.repeat(70)}`)
    for (const g of gamesByYear[year]) {
      gameEntries.push(`  {
    id: '${escapeTitle(g.id)}',
    title: '${escapeTitle(g.title)}',
    year: ${g.year},
    igdbImageId: '${g.igdbImageId}',
    popularityRank: ${g.popularityRank},
  },`)
    }
    gameEntries.push('')
  }

  const gamesTs = `// Generated by scripts/generate-street-date-data.mjs — DO NOT EDIT MANUALLY

export interface StreetDateGame {
  /** Kebab-case slug, e.g. "halo-combat-evolved" */
  id: string
  title: string
  /** Original release year */
  year: number
  /** IGDB cover image_id (just the ID, not full URL) */
  igdbImageId: string
  /** 1 = most obscure within year, 5 = most iconic */
  popularityRank: number
}

export const GAMES: StreetDateGame[] = [
${gameEntries.join('\n')}]
`

  fs.writeFileSync(path.join(dataDir, 'games.ts'), gamesTs, 'utf8')
  console.log(`\nWritten to src/app/play/street-date/data/games.ts`)

  // Write years.ts
  const yearsTs = `// Generated by scripts/generate-street-date-data.mjs — DO NOT EDIT MANUALLY
export const VALID_YEARS: number[] = [${validYears.join(', ')}]
`

  fs.writeFileSync(path.join(dataDir, 'years.ts'), yearsTs, 'utf8')
  console.log(`Written to src/app/play/street-date/data/years.ts`)

  // ── Step 6: Print summary ──────────────────────────────────────────────────

  console.log(`\n✓ Generated ${allGames.length} games across ${validYears.length} valid years`)
  console.log(`✓ Year range: ${validYears[0]}–${validYears[validYears.length - 1]}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
