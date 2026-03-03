// scripts/generate-shelf-price-data.mjs
// Generates Shelf Price game data by querying IGDB API + Claude for launch prices
// Usage: node scripts/generate-shelf-price-data.mjs
// Requires: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, ANTHROPIC_API_KEY in .env.local

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
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env.local')
  process.exit(1)
}

if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY must be set in .env.local')
  process.exit(1)
}

console.log('Loaded credentials from .env.local')

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

// ── Step 4: Call Claude API for price lookup ────────────────────────────────────

async function lookupPrice(title, year) {
  const prompt = `What was the US launch retail price (MSRP) of the video game '${title}' released in ${year}? Reply with ONLY the numeric dollar amount, no dollar sign, no text. Example: 49.99`

  const MAX_RETRIES = 3

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 50,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (res.status === 529 || res.status === 429 || res.status >= 500) {
        if (attempt < MAX_RETRIES) {
          const backoff = 2000 * Math.pow(2, attempt) // 2s, 4s, 8s
          console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for '${title}' (${res.status}) — waiting ${backoff / 1000}s...`)
          await sleep(backoff)
          continue
        }
        const text = await res.text()
        console.warn(`  Claude API error after ${MAX_RETRIES} retries (${res.status}): ${text}`)
        return null
      }

      if (!res.ok) {
        const text = await res.text()
        console.warn(`  Claude API error (${res.status}): ${text}`)
        return null
      }

      const data = await res.json()
      const reply = data.content?.[0]?.text?.trim()
      if (!reply) return null

      const price = parseFloat(reply)
      if (isNaN(price) || price < 0 || price > 99.99) {
        console.warn(`  Invalid price response for '${title}': "${reply}"`)
        return null
      }

      return price
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const backoff = 2000 * Math.pow(2, attempt)
        console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for '${title}' (network error) — waiting ${backoff / 1000}s...`)
        await sleep(backoff)
        continue
      }
      console.warn(`  Claude API call failed for '${title}' after ${MAX_RETRIES} retries: ${err.message}`)
      return null
    }
  }

  return null
}

// ── Default price by era ───────────────────────────────────────────────────────

function defaultPrice(year) {
  if (year >= 2020) return 69.99
  if (year >= 2013) return 59.99
  return 49.99
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

// ── Sleep helper ───────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Authenticating with Twitch...')
  const token = await getTwitchToken()
  console.log('Authenticated successfully\n')

  const TARGET_YEARS = Array.from({ length: 36 }, (_, i) => 1990 + i) // 1990-2025
  const MIN_GAMES = 5

  const allGames = []
  const validYears = []

  // ── Phase 1: Fetch games from IGDB ─────────────────────────────────────────

  console.log('=== Phase 1: Fetching games from IGDB ===\n')

  const yearCandidates = {} // year -> enriched games array

  for (const year of TARGET_YEARS) {
    const startTimestamp = Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000)
    const endTimestamp = Math.floor(new Date(`${year + 1}-01-01T00:00:00Z`).getTime() / 1000)

    // Query top games for this year sorted by total_rating_count
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
      await sleep(300)

      // Filter to games with a cover ID
      const withCovers = games.filter((g) => g.cover)

      if (withCovers.length < MIN_GAMES) {
        console.log(`${year}: Only ${withCovers.length} games with covers — SKIPPING`)
        continue
      }

      // Resolve cover image_ids via the /covers endpoint
      const coverIds = withCovers.map((g) => g.cover)
      const coverQuery = `fields game, image_id; where id = (${coverIds.join(',')}); limit 30;`
      const covers = await queryIGDB(token, 'covers', coverQuery)
      await sleep(300)

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

      yearCandidates[year] = enriched
      console.log(`${year}: ${enriched.length} candidate games found`)
    } catch (err) {
      console.error(`${year}: ERROR — ${err.message}`)
    }
  }

  // ── Phase 2: Select ~5 games per year and lookup prices ────────────────────

  console.log('\n=== Phase 2: Looking up launch prices via Claude ===\n')

  let priceLookupsTotal = 0
  let priceLookupsValid = 0
  let priceLookupsDefault = 0

  for (const year of TARGET_YEARS) {
    const enriched = yearCandidates[year]
    if (!enriched) continue

    // Pick games at different popularity tiers for variety
    // We pick ~10 candidates, get prices, then select 5 with varied price points
    const candidateIndices =
      enriched.length >= 20
        ? [0, 2, 5, 8, 12, 15, 18, Math.min(22, enriched.length - 1), Math.min(25, enriched.length - 1), Math.min(28, enriched.length - 1)]
        : enriched.length >= 15
          ? [0, 2, 4, 6, 8, 10, 12, Math.min(14, enriched.length - 1)]
          : enriched.length >= 10
            ? [0, 1, 3, 5, 7, Math.min(9, enriched.length - 1)]
            : [0, 1, 2, 3, Math.min(4, enriched.length - 1)]

    // Deduplicate indices
    const uniqueIndices = [...new Set(candidateIndices)].filter((i) => i < enriched.length)

    const candidates = []
    for (const idx of uniqueIndices) {
      const game = enriched[idx]
      priceLookupsTotal++

      const price = await lookupPrice(game.name, year)
      await sleep(500)

      const finalPrice = price !== null ? price : defaultPrice(year)
      if (price !== null) {
        priceLookupsValid++
        console.log(`  ${game.name} (${year}): $${finalPrice}`)
      } else {
        priceLookupsDefault++
        console.log(`  ${game.name} (${year}): $${finalPrice} (default)`)
      }

      candidates.push({
        id: slugify(game.name),
        title: game.name,
        year,
        igdbImageId: game.imageId,
        launchPriceUsd: finalPrice,
      })
    }

    // Select 5 games trying to get varied price points
    // Sort by price, then pick spread across the range
    const byPrice = [...candidates].sort((a, b) => a.launchPriceUsd - b.launchPriceUsd)

    let selected
    if (byPrice.length <= 5) {
      selected = byPrice
    } else {
      // Pick: lowest price, highest price, middle, and two more spread out
      const picks = new Set()
      picks.add(0) // lowest
      picks.add(byPrice.length - 1) // highest
      picks.add(Math.floor(byPrice.length / 2)) // middle

      // Fill remaining from spread positions
      const step = byPrice.length / 5
      for (let i = 0; picks.size < 5 && i < byPrice.length; i++) {
        const idx = Math.floor(i * step)
        if (idx < byPrice.length) picks.add(idx)
      }

      // If still not 5, just add remaining in order
      for (let i = 0; picks.size < 5 && i < byPrice.length; i++) {
        picks.add(i)
      }

      selected = [...picks].sort((a, b) => a - b).map((i) => byPrice[i])
    }

    allGames.push(...selected)
    validYears.push(year)
    console.log(`${year}: Selected ${selected.length} games with prices: [${selected.map((g) => `$${g.launchPriceUsd}`).join(', ')}]\n`)
  }

  // ── Phase 3: Write output file ─────────────────────────────────────────────

  console.log('=== Phase 3: Writing output file ===\n')

  const dataDir = path.resolve(ROOT, 'src/app/play/shelf-price/data')

  // Create directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log(`Created directory: ${dataDir}`)
  }

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
    launchPriceUsd: ${g.launchPriceUsd},
  },`)
    }
    gameEntries.push('')
  }

  const gamesTs = `// Generated by scripts/generate-shelf-price-data.mjs — DO NOT EDIT MANUALLY

export interface ShelfPriceGame {
  /** Kebab-case slug, e.g. "halo-combat-evolved" */
  id: string
  /** Display name */
  title: string
  /** Release year */
  year: number
  /** IGDB cover image_id (just the ID, not full URL) */
  igdbImageId: string
  /** US launch retail price in USD, e.g. 59.99 */
  launchPriceUsd: number
}

export const GAMES: ShelfPriceGame[] = [
${gameEntries.join('\n')}]
`

  fs.writeFileSync(path.join(dataDir, 'games.ts'), gamesTs, 'utf8')
  console.log(`Written to src/app/play/shelf-price/data/games.ts`)

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log(`\n=== Summary ===`)
  console.log(`Total games: ${allGames.length}`)
  console.log(`Valid years: ${validYears.length} (${validYears[0]}–${validYears[validYears.length - 1]})`)
  console.log(`Price lookups: ${priceLookupsTotal} total, ${priceLookupsValid} valid, ${priceLookupsDefault} defaulted`)

  // Price distribution
  const priceBuckets = {}
  for (const g of allGames) {
    const bucket = `$${g.launchPriceUsd}`
    priceBuckets[bucket] = (priceBuckets[bucket] || 0) + 1
  }
  console.log(`\nPrice distribution:`)
  for (const [price, count] of Object.entries(priceBuckets).sort((a, b) => parseFloat(a[0].slice(1)) - parseFloat(b[0].slice(1)))) {
    console.log(`  ${price}: ${count} games`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
